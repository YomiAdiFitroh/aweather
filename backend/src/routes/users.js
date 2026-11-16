const express = require('express');
const prisma = require('../prisma');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/httpError');

const router = express.Router();

// Protected: every route in this file requires a valid access token.
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  })
);

module.exports = router;
