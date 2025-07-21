const express = require('express');
const router = express.Router();
const {
  generateAnalyticsSnapshot,
  getLatestAnalyticsSnapshot
} = require('../controllers/AnalyticsController');

// Generate analytics snapshot (admin only)
router.post('/generate', generateAnalyticsSnapshot);

// Get latest analytics for dashboard
router.get('/latest', getLatestAnalyticsSnapshot);

module.exports = router;
