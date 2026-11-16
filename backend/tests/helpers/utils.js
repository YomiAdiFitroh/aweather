const request = require('supertest');
const app = require('../../src/app');

const validUser = { name: 'Yomi', email: 'yomi@example.com', password: 'supersecret1' };

const refreshCookie = (res) => res.headers['set-cookie'].find((c) => c.startsWith('refresh_token=')).split(';')[0];

async function registerUser(user = validUser) {
  const res = await request(app).post('/api/auth/register').send(user);
  return { res, accessToken: res.body.accessToken, cookie: res.headers['set-cookie'] && refreshCookie(res) };
}

module.exports = { app, request, validUser, refreshCookie, registerUser };
