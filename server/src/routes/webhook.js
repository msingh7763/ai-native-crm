const express = require('express');
const router = express.Router();
const { handleReceipt, streamUpdates } = require('../controllers/webhookController');

router.post('/receipt', handleReceipt);
router.get('/stream', streamUpdates);

module.exports = router;
