const express = require('express');
const router = express.Router();
const {
  generateAnalyticsSnapshot,
  getLatestAnalyticsSnapshot,
  getChartData
} = require('../controllers/AnalyticsController');

// Generate analytics snapshot (admin only)
router.post('/generate', generateAnalyticsSnapshot);

// Get latest analytics for dashboard
router.get('/latest', getLatestAnalyticsSnapshot);

router.get('/chart', getChartData);

module.exports = router;
