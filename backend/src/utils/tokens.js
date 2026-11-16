const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const prisma = require('../prisma');

const COOKIE_NAME = 'refresh_token';

const cookieOptions = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: 'lax',
  path: '/api/auth',
  maxAge: config.refreshTtlDays * 24 * 60 * 60 * 1000,
};

const signAccessToken = (userId) =>
  jwt.sign({ sub: userId }, config.accessSecret, { expiresIn: config.accessTtl, algorithm: 'HS256' });

const verifyAccessToken = (token) =>
  jwt.verify(token, config.accessSecret, { algorithms: ['HS256'] });

const verifyRefreshToken = (token) =>
  jwt.verify(token, config.refreshSecret, { algorithms: ['HS256'] });

// Refresh tokens are stored hashed, so a database leak does not leak usable tokens.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

async function issueSession(res, userId) {
  const accessToken = signAccessToken(userId);
  const refreshToken = jwt.sign({ sub: userId, jti: crypto.randomUUID() }, config.refreshSecret, {
    expiresIn: `${config.refreshTtlDays}d`,
    algorithm: 'HS256',
  });
  const { exp } = jwt.decode(refreshToken);

  await prisma.refreshToken.create({
    data: { tokenHash: hashToken(refreshToken), userId, expiresAt: new Date(exp * 1000) },
  });

  res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
  return accessToken;
}

function clearRefreshCookie(res) {
  const { maxAge, ...options } = cookieOptions;
  res.clearCookie(COOKIE_NAME, options);
}

module.exports = {
  COOKIE_NAME,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  issueSession,
  clearRefreshCookie,
};
