
const paystack = require('../controller/paymentcontroller');
const authenticateUser = require('../services/authenticateUser');
const express = require('express');
const router = express.Router();



/**
 * @swagger
 * /payment/webhook:
 *   post:
 *     summary: Paystack webhook endpoint
 *     description: Handles Paystack payment events such as "charge.success". Updates payment status in the database.
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Webhook payload sent by Paystack
 *             properties:
 *               event:
 *                 type: string
 *                 example: "charge.success"
 *               
 *                       
 *                       
 *                         
 *                        
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "OK"
 *       401:
 *         description: Invalid signature
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "invalid signature"
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Internal server error"
 */
router.post('/webhook',express.raw({type:'application/json'}), paystack.paystackWebhook);

module.exports = router;