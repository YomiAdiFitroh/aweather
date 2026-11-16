require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

function secret(name) {
  const value = process.env[name];
  if (value) return value;
  if (isTest) return `test-${name.toLowerCase()}`;
  throw new Error(`Missing required env var ${name}`);
}

module.exports = {
  isTest,
  isProd,
  port: Number(process.env.PORT) || 4000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  accessSecret: secret('JWT_ACCESS_SECRET'),
  refreshSecret: secret('JWT_REFRESH_SECRET'),
  accessTtl: '15m',
  refreshTtlDays: 7,
  weatherApiKey: process.env.WEATHER_API_KEY || '',
};
