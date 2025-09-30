
const paystack = require('../controller/paymentcontroller');
const authenticateUser = require('../services/authenticateUser');
const express = require('express');
const router = express.Router();

router.post('/initialize', authenticateUser, paystack.initializePayment);
router.post('/webhook',paystack.paystackWebhook);

module.exports = router;