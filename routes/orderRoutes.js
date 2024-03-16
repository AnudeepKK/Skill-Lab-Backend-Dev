const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

router.post('/place-order', orderController.placeOrder);
router.post('/feedback/:orderId',orderController.submitFeedback);
router.post('/location', orderController.updateOrderLocation);

module.exports = router;
