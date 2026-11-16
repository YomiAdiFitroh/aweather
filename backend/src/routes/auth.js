const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const prisma = require('../prisma');
const config = require('../config');
const { requireAuth } = require('../middleware/auth');
const { HttpError, asyncHandler } = require('../utils/httpError');
const {
  COOKIE_NAME,
  verifyRefreshToken,
  hashToken,
  issueSession,
  clearRefreshCookie,
} = require('../utils/tokens');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: { error: 'Too many attempts, please try again later' },
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt });

// Used to keep login timing similar whether or not the email exists.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

router.post(
  '/register',
  limiter,
  asyncHandler(async (req, res) => {
    const { name, email, password } = registerSchema.parse(req.body);

    if (await prisma.user.findUnique({ where: { email } })) {
      throw new HttpError(409, 'Email already registered');
    }

    let user;
    try {
      user = await prisma.user.create({
        data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
      });
    } catch (err) {
      if (err.code === 'P2002') throw new HttpError(409, 'Email already registered');
      throw err;
    }

    const accessToken = await issueSession(res, user.id);
    res.status(201).json({ user: publicUser(user), accessToken });
  })
);

router.post(
  '/login',
  limiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    const valid = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
    if (!user || !valid) throw new HttpError(401, 'Invalid email or password');

    const accessToken = await issueSession(res, user.id);
    res.json({ user: publicUser(user), accessToken });
  })
);

// Refresh token rotation: every refresh revokes the old token and issues a new one.
// Presenting an already-used token is treated as theft, so all sessions are revoked.
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies[COOKIE_NAME];
    if (!token) throw new HttpError(401, 'Missing refresh token');

    try {
      verifyRefreshToken(token);
    } catch {
      clearRefreshCookie(res);
      throw new HttpError(401, 'Invalid or expired refresh token');
    }

    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!stored) {
      clearRefreshCookie(res);
      throw new HttpError(401, 'Invalid refresh token');
    }

    if (stored.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      clearRefreshCookie(res);
      throw new HttpError(401, 'Refresh token reuse detected');
    }

    if (stored.expiresAt < new Date()) {
      clearRefreshCookie(res);
      throw new HttpError(401, 'Refresh token expired');
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) {
      clearRefreshCookie(res);
      throw new HttpError(401, 'User no longer exists');
    }

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    const accessToken = await issueSession(res, user.id);
    res.json({ user: publicUser(user), accessToken });
  })
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies[COOKIE_NAME];
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(token), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    clearRefreshCookie(res);
    res.status(204).end();
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw new HttpError(401, 'User no longer exists');
    res.json({ user: publicUser(user) });
  })
);

module.exports = router;
