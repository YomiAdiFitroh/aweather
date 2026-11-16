const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { HttpError, asyncHandler } = require('../utils/httpError');
const weather = require('../services/weather');

const router = express.Router();
router.use(requireAuth);

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const city = req.query.city || 'Jakarta';
    // Allow-list: the city ends up in an upstream URL, so never trust arbitrary input.
    if (!weather.CITIES.includes(city)) throw new HttpError(400, 'Unsupported city');
    res.json(await weather.getDashboard(city));
  })
);

router.get(
  '/cities',
  asyncHandler(async (req, res) => {
    res.json({ cities: await weather.getCities() });
  })
);

router.get(
  '/alerts',
  asyncHandler(async (req, res) => {
    res.json({ alerts: await weather.getAlerts(), generatedAt: new Date().toISOString() });
  })
);

module.exports = router;
