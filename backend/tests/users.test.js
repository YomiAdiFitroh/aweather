jest.mock('../src/prisma', () => require('./helpers/fakePrisma'));

const jwt = require('jsonwebtoken');
const config = require('../src/config');
const fakePrisma = require('./helpers/fakePrisma');
const { app, request, registerUser } = require('./helpers/utils');

beforeEach(() => fakePrisma.reset());

describe('GET /api/users (protected)', () => {
  it('returns the user list for a valid token, without password hashes', async () => {
    await registerUser({ name: 'Ana', email: 'ana@example.com', password: 'password123' });
    const { accessToken } = await registerUser({ name: 'Budi', email: 'budi@example.com', password: 'password123' });

    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
    expect(res.body.users[0]).toEqual(
      expect.objectContaining({ id: expect.any(String), name: expect.any(String), email: expect.any(String) })
    );
    res.body.users.forEach((u) => {
      expect(u.passwordHash).toBeUndefined();
    });
  });

  it('rejects a request without a token with 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('rejects an invalid token with 401', async () => {
    const res = await request(app).get('/api/users').set('Authorization', 'Bearer not.a.jwt');
    expect(res.status).toBe(401);
  });

  it('rejects an expired token with 401', async () => {
    const expired = jwt.sign({ sub: 'x' }, config.accessSecret, { expiresIn: -10 });
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it('rejects a token signed with the wrong secret with 401', async () => {
    const forged = jwt.sign({ sub: 'x' }, 'attacker-secret', { expiresIn: '5m' });
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('rejects an unsigned (alg: none) token with 401', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: 'x' })).toString('base64url');
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${header}.${payload}.`);
    expect(res.status).toBe(401);
  });
});
