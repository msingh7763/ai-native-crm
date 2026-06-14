const express = require('express');
const router = express.Router();
const { generateDemoData } = require('../controllers/demoController');

router.post('/generate', generateDemoData);

module.exports = router;
