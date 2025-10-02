
const paystack = require('../controller/paymentcontroller');
const authenticateUser = require('../services/authenticateUser');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /payment/initialize:
 *   post:
 *     summary: Initialize a Paystack payment
 *     description: Initializes a payment transaction with Paystack and returns the authorization URL, access code, and reference.
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Email
 *               - Amount
 *               - requestId
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: "isaacemmanueltech1@gmail.com"
 *                 description: The email of the user making the payment
 *               Amount:
 *                 type: number
 *                 example: 5000
 *                 description: The amount to be paid in Naira
 *               requestId:
 *                 type: string
 *                 example: "68cf202e9a94c55ca468d63d"
 *                 description: The unique ID of the request associated with this payment
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment initialized"
 *                 authorization_url:
 *                   type: string
 *                   example: "https://paystack.com/pay/xyz123"
 *                 access_code:
 *                   type: string
 *                   example: "ACCESSCODE123"
 *                 reference:
 *                   type: string
 *                   example: "REF123456789"
 *       400:
 *         description: Bad request – missing required fields
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Email, Amount, and requestId are required"
 *       500:
 *         description: Internal server error – payment initialization failed
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Payment initialization failed"
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post('/initialize', authenticateUser, paystack.initializePayment);

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
router.post('/webhook',paystack.paystackWebhook);

module.exports = router;