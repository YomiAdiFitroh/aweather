jest.mock('../src/prisma', () => require('./helpers/fakePrisma'));

const fakePrisma = require('./helpers/fakePrisma');
const { app, request, registerUser } = require('./helpers/utils');

beforeEach(() => fakePrisma.reset());

describe('weather endpoints (protected)', () => {
  it('returns the dashboard for a valid token', async () => {
    const { accessToken } = await registerUser();
    const res = await request(app).get('/api/weather/dashboard?city=Bandung').set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.location.city).toBe('Bandung');
    expect(res.body.hourly).toHaveLength(8);
    expect(res.body.hourly[0].label).toBe('Now');
    expect(res.body.daily).toHaveLength(6);
    expect(res.body.daily[0].label).toBe('Today');
    expect(res.body.daily[1].label).toBe('Tomorrow');
    expect(res.body.sun).toEqual({ sunrise: expect.stringMatching(/^\d{2}:\d{2}$/), sunset: expect.stringMatching(/^\d{2}:\d{2}$/) });
    expect(res.body.highlights.humidity).toEqual({ value: expect.any(Number), label: expect.any(String) });
    expect(res.body.highlights.rainChance.value).toBeGreaterThanOrEqual(0);
  });

  it('defaults to Jakarta', async () => {
    const { accessToken } = await registerUser();
    const res = await request(app).get('/api/weather/dashboard').set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.location.city).toBe('Jakarta');
  });

  it('lists the popular cities', async () => {
    const { accessToken } = await registerUser();
    const res = await request(app).get('/api/weather/cities').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.cities.map((c) => c.city)).toEqual(['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta']);
    res.body.cities.forEach((c) => expect(c.high).toBeGreaterThanOrEqual(c.low));
  });

  it('rejects an unsupported city with 400', async () => {
    const { accessToken } = await registerUser();
    const res = await request(app).get('/api/weather/dashboard?city=Atlantis').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(400);
  });

  it('rejects requests without a token with 401', async () => {
    expect((await request(app).get('/api/weather/dashboard')).status).toBe(401);
    expect((await request(app).get('/api/weather/cities')).status).toBe(401);
  });
});
