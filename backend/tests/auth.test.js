jest.mock('../src/prisma', () => require('./helpers/fakePrisma'));

const jwt = require('jsonwebtoken');
const config = require('../src/config');
const fakePrisma = require('./helpers/fakePrisma');
const { app, request, validUser, refreshCookie, registerUser } = require('./helpers/utils');

beforeEach(() => fakePrisma.reset());

describe('POST /api/auth/register', () => {
  it('creates a user, returns an access token and sets an httpOnly refresh cookie', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ name: 'Yomi', email: 'yomi@example.com' });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie'][0]).toMatch(/refresh_token=.*HttpOnly/);
  });

  it('rejects a duplicate email with 409', async () => {
    await registerUser();
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
  });

  it('rejects an invalid email with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validUser, email: 'nope' });
    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe('email');
  });

  it('rejects a short password with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validUser, password: 'short' });
    expect(res.status).toBe(400);
  });

  it('rejects a missing body with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(registerUser);

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
  });

  it('is case-insensitive on email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'YOMI@EXAMPLE.COM', password: validUser.password });
    expect(res.status).toBe(200);
  });

  it('rejects a wrong password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: validUser.email, password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('rejects an unknown email with the same 401 message', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'whatever123' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('rejects an empty password with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: validUser.email, password: '' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me (JWT guard)', () => {
  it('returns the user for a valid token', async () => {
    const { accessToken } = await registerUser();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  it('rejects a missing token with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed Authorization header with 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Token abc');
    expect(res.status).toBe(401);
  });

  it('rejects a tampered token with 401', async () => {
    const { accessToken } = await registerUser();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}x`);
    expect(res.status).toBe(401);
  });

  it('rejects an expired token with 401', async () => {
    const expired = jwt.sign({ sub: 'someone' }, config.accessSecret, { expiresIn: -10 });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it('rejects a token signed with the refresh secret with 401', async () => {
    const wrong = jwt.sign({ sub: 'someone' }, config.refreshSecret, { expiresIn: '5m' });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${wrong}`);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('issues a new access token and rotates the refresh cookie', async () => {
    const { cookie } = await registerUser();
    const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(refreshCookie(res)).not.toBe(cookie);
  });

  it('rejects a request without a cookie with 401', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('rejects a garbage cookie with 401', async () => {
    const res = await request(app).post('/api/auth/refresh').set('Cookie', 'refresh_token=garbage');
    expect(res.status).toBe(401);
  });

  it('detects reuse of a rotated token and revokes the whole session family', async () => {
    const { cookie: first } = await registerUser();

    const rotated = await request(app).post('/api/auth/refresh').set('Cookie', first);
    const second = refreshCookie(rotated);

    const replay = await request(app).post('/api/auth/refresh').set('Cookie', first);
    expect(replay.status).toBe(401);

    const afterTheft = await request(app).post('/api/auth/refresh').set('Cookie', second);
    expect(afterTheft.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('revokes the refresh token so it cannot be used again', async () => {
    const { cookie } = await registerUser();

    const out = await request(app).post('/api/auth/logout').set('Cookie', cookie);
    expect(out.status).toBe(204);

    const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(res.status).toBe(401);
  });

  it('succeeds even when there is no session', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(204);
  });
});

describe('POST /api/auth/logout-all', () => {
  it('revokes every session for the user', async () => {
    const { accessToken, cookie: deviceA } = await registerUser();
    const loginB = await request(app).post('/api/auth/login').send({ email: validUser.email, password: validUser.password });
    const deviceB = refreshCookie(loginB);

    const res = await request(app).post('/api/auth/logout-all').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(204);

    expect((await request(app).post('/api/auth/refresh').set('Cookie', deviceA)).status).toBe(401);
    expect((await request(app).post('/api/auth/refresh').set('Cookie', deviceB)).status).toBe(401);
  });

  it("does not touch other users' sessions", async () => {
    const { accessToken } = await registerUser();
    const other = await registerUser({ name: 'Other', email: 'other@example.com', password: 'password123' });

    await request(app).post('/api/auth/logout-all').set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app).post('/api/auth/refresh').set('Cookie', other.cookie);
    expect(res.status).toBe(200);
  });

  it('rejects a request without a token with 401', async () => {
    const res = await request(app).post('/api/auth/logout-all');
    expect(res.status).toBe(401);
  });
});