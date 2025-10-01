const user = require('../controller/usercontroller');
const express = require('express');
const router = express.Router();
const authorizedUser = require('../services/authorizeUser');
const authenticateUser = require('../services/authenticateUser');

/**
 * @swagger
 * tags:
 *   name: auth
 *   description: User management and authentication
 */

/**
 * @swagger
 * /auth/signUp:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - surnName
 *               - email
 *               - password
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Emmanuel
 *               surnName:
 *                 type: string
 *                 example: Isaac
 *               email:
 *                 type: string
 *                 format: email
 *                 example: woutkenny@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mySecurePassword123
 *               role:
 *                 type: string
 *                 example: customer
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user successfully created
 *                 firstName:
 *                   type: string
 *                   example: isac
 *                 surnName:
 *                   type: string
 *                   example: emmanuel
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       403:
 *         description: All fields are required
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */

router.post('/signUp', user.createUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: isaac@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mySecurePassword123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successfully
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid password
 *       403:
 *         description: Email and password are required
 *       404:
 *         description: Invalid credentials (user not found)
 *       500:
 *         description: Internal server error
 */
router.post('/login', user.loginUser);
/**
 * @swagger
 * /auth/all/users:
 *   get:
 *     summary: Get all registered users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: users fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         example: 64f2f22a1d23bc45c67d8901
 *                       firstNname:
 *                         type: string
 *                         example: John
 *                       surnName:
 *                         type: string
 *                         example: Doe
 *                       role:
 *                         type: string
 *                         example: admin
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: No users found
 *       500:
 *         description: Internal server error
 */
router.get('/all/users',authenticateUser, authorizedUser('admin'), user.getAlluser);

/**
 * @swagger
 * /auth/costumers:
 *   get:
 *     summary: Get all users with role "costumer" (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: users fetch successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f2f22a1d23bc45c67d8901
 *                       firstName:
 *                         type: string
 *                         example: Isaac
 *                       surnName:
 *                         type: string
 *                         example: Emmauel
 *                       email:
 *                         type: string
 *                         example: isaac@gmail.com
 *                       role:
 *                         type: string
 *                         example: costumer
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: No users found
 *       500:
 *         description: Internal server error
 */
router.get('/costumers',authenticateUser,authorizedUser('admin'), user.getAllCostumer);

/**
 * @swagger
 * /auth/riders:
 *   get:
 *     summary: Get all users with role "rider" (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Riders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: users fetch successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f2f22a1d23bc45c67d8901
 *                       firstName:
 *                         type: string
 *                         example: Idiku
 *                       surnName:
 *                         type: string
 *                         example: Paul
 *                       email:
 *                         type: string
 *                         example: idiku.paul@example.com
 *                       role:
 *                         type: string
 *                         example: rider
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: No riders found
 *       500:
 *         description: Internal server error
 */
router.get('/riders',authenticateUser, authorizedUser('admin'), user.getAllRiders);

module.exports = router;
