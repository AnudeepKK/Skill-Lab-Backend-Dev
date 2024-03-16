const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');


router.post('/placeorder', orderController.placeOrder);
router.post('/feedback/:orderId',orderController.submitFeedback);
router.get('/delivery/:orderId',orderController.deliverOrder)
router.get('/verifyOTP/:orderId/:otp', orderController.verifyOtp);
// router.post('/placeorder', orderController.placeOrder);
// router.post('/feedback/:orderId', orderController.submitFeedback);


module.exports = router;
