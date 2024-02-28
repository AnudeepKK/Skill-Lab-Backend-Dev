const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

router.post('/place-order', orderController.placeOrder);
router.post('/feedback/:orderId',orderController.submitFeedback);

module.exports = router;
