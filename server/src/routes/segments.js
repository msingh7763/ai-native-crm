const express = require('express');
const router = express.Router();
const { buildSegment } = require('../controllers/segmentController');

router.post('/build', buildSegment);

module.exports = router;
