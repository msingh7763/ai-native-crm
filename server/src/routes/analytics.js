const express = require('express');
const router = express.Router();
const { getAnalytics, clearAnalyticsCache } = require('../controllers/analyticsController');

router.get('/', getAnalytics);
router.delete('/cache', clearAnalyticsCache);

module.exports = router;
