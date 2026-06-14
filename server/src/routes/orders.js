const express = require('express');
const router = express.Router();
const { getOrders, addOrder } = require('../controllers/orderController');

router.get('/', getOrders);
router.post('/', addOrder);

module.exports = router;
