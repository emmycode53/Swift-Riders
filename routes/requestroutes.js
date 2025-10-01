const express = require('express');
const authenticateUser = require('../services/authenticateUser');
const authorizedUser = require('../services/authorizeUser');
const request = require('../controller/requestcontroller');
const router = express.Router()

/**
 * @swagger
 * /request/create:
 *   post:
 *     summary: Create a new delivery request (costumer only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickup
 *               - dropoff
 *               - package_details
 *               - cost
 *             properties:
 *               pickup:
 *                 type: string
 *                 example: "123 Main Street, Lagos"
 *               dropoff:
 *                 type: string
 *                 example: "45 Marina Road, Abuja"
 *               package_details:
 *                 type: string
 *                 example: "Small box, fragile"
 *               cost:
 *                 type: number
 *                 example: 2500
 *     responses:
 *       201:
 *         description: Delivery request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: request has been created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 651f3b2a8d4a9f1234567890
 *                     costumerId:
 *                       type: string
 *                       example: 6501b7e6d4a9f1234567890
 *                     pickup:
 *                       type: string
 *                       example: "123 Main Street, Lagos"
 *                     dropoff:
 *                       type: string
 *                       example: "45 Marina Road, Abuja"
 *                     package_details:
 *                       type: string
 *                       example: "Small box, fragile"
 *                     cost:
 *                       type: number
 *                       example: 2500
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Forbidden - only costumers can create requests
 *       303:
 *         description: Failed to create request
 *       500:
 *         description: Internal server error
 */
router.post('/create',authenticateUser, authorizedUser('costumer'), request.createdeliveryrequest);
/**
 * @swagger
 * /request:
 *   get:
 *     summary: Get all available (pending) delivery requests
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available pending requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Available requests
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6521dcbf8d4a9f1234567890
 *                       costumerId:
 *                         type: string
 *                         example: 6501b7e6d4a9f1234567890
 *                       pickup:
 *                         type: string
 *                         example: "123 Main Street, Lagos"
 *                       dropoff:
 *                         type: string
 *                         example: "45 Marina Road, Abuja"
 *                       package_details:
 *                         type: string
 *                         example: "Medium parcel, fragile"
 *                       cost:
 *                         type: number
 *                         example: 5000
 *                       status:
 *                         type: string
 *                         example: pending
 *       404:
 *         description: No pending requests are available
 *       403:
 *         description: Forbidden - only riders can access this route
 *       500:
 *         description: Internal server error
 */
router.get('/',authenticateUser, authorizedUser('rider'), request.getAvailableRequests);

/**
 * @swagger
 * /request/accept/{id}:
 *   put:
 *     summary: Accept a delivery request (Rider only)
 *     description: Allows a rider to accept a pending delivery request. Once accepted, the request status changes to **accepted** and the customer is notified via email.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the delivery request to accept
 *     responses:
 *       200:
 *         description: Request accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request accepted
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6521dcbf8d4a9f1234567890
 *                     costumerId:
 *                       type: string
 *                       example: 6501b7e6d4a9f1234567890
 *                     pickup:
 *                       type: string
 *                       example: "123 Main Street, Lagos"
 *                     dropoff:
 *                       type: string
 *                       example: "45 Marina Road, Abuja"
 *                     package_details:
 *                       type: string
 *                       example: "Medium parcel, fragile"
 *                     cost:
 *                       type: number
 *                       example: 5000
 *                     status:
 *                       type: string
 *                       example: accepted
 *                     riderId:
 *                       type: string
 *                       example: 6501d7f6d4a9f1234567890
 *       400:
 *         description: Request not available (already accepted or invalid)
 *       403:
 *         description: Forbidden - only riders can accept requests
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
router.put('/accept/:id',authenticateUser, authorizedUser('rider'), request.acceptRequest);

/**
 * @swagger
 * /request/{id}:
 *   patch:
 *     summary: Update the status of a delivery request (Rider only)
 *     description: Allows a rider to update the status of an assigned delivery request. Valid statuses are **accepted**, **in-progress**, and **completed**.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the delivery request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, in-progress, completed]
 *                 example: in-progress
 *     responses:
 *       200:
 *         description: Request status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request status updated to in-progress
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6521dcbf8d4a9f1234567890
 *                     pickup:
 *                       type: string
 *                       example: "123 Main Street, Lagos"
 *                     dropoff:
 *                       type: string
 *                       example: "45 Marina Road, Abuja"
 *                     package_details:
 *                       type: string
 *                       example: "Small electronics"
 *                     cost:
 *                       type: number
 *                       example: 3500
 *                     costumerId:
 *                       type: string
 *                       example: 6501b7e6d4a9f1234567890
 *                     riderId:
 *                       type: string
 *                       example: 6501d7f6d4a9f1234567890
 *                     status:
 *                       type: string
 *                       example: in-progress
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Forbidden - only riders can update request status
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id',authenticateUser, authorizedUser('rider'), request.updateStatus);

/**
 * @swagger
 * /request/analytics:
 *   get:
 *     summary: Get platform analytics (Admin only)
 *     description: Returns aggregated analytics including total customers, riders, requests, completed requests, and revenue.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Analytics
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCostumer:
 *                       type: integer
 *                       example: 150
 *                     totalRider:
 *                       type: integer
 *                       example: 45
 *                     totalRequests:
 *                       type: integer
 *                       example: 300
 *                     completedRequests:
 *                       type: integer
 *                       example: 220
 *                     totalRevenue:
 *                       type: number
 *                       example: 450000
 *       403:
 *         description: Forbidden - only admins can access this route
 *       500:
 *         description: Error fetching analytics
 */
router.get('/analytics',authenticateUser,authorizedUser('admin'), request.getAnalytics);

/**
 * @swagger
 * /request/single/{id}:
 *   get:
 *     summary: Get a single delivery request (Admin only)
 *     description: Fetches details of a single delivery request by its ID, including populated customer and rider info.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the delivery request
 *         schema:
 *           type: string
 *           example: 6521dcbf8d4a9f1234567890
 *     responses:
 *       200:
 *         description: Successfully fetched a request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: successfully fetched request
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6521dcbf8d4a9f1234567890
 *                     pickup:
 *                       type: string
 *                       example: "Lekki Phase 1, Lagos"
 *                     dropoff:
 *                       type: string
 *                       example: "Ikeja City Mall, Lagos"
 *                     package_details:
 *                       type: string
 *                       example: "Bag of clothes"
 *                     cost:
 *                       type: number
 *                       example: 5000
 *                     status:
 *                       type: string
 *                       example: pending
 *                     costumerId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6501b7e6d4a9f1234567890
 *                         firstName:
 *                           type: string
 *                           example: Isaac
 *                         surnName:
 *                           type: string
 *                           example: Emmanuel
 *                     riderId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6501d7f6d4a9f1234567890
 *                         firstName:
 *                           type: string
 *                           example: Ibukun
 *                         surnName:
 *                           type: string
 *                           example: Wale
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: this request is no longer available
 *       403:
 *         description: Forbidden - only admins can access
 *       500:
 *         description: Internal server error
 */
router.get('/single/:id', authenticateUser, authorizedUser("admin"), request.getSingleRequest);

/**
 * @swagger
 * /request/all:
 *   get:
 *     summary: Get all delivery requests (Admin only)
 *     description: Fetches all delivery requests with customer and rider details populated.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all delivery requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: delivery request successfully fetched
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6521dcbf8d4a9f1234567890
 *                       pickup:
 *                         type: string
 *                         example: "123 Main Street, Lagos"
 *                       dropoff:
 *                         type: string
 *                         example: "45 Marina Road, Abuja"
 *                       package_details:
 *                         type: string
 *                         example: "Box of electronics"
 *                       cost:
 *                         type: number
 *                         example: 7500
 *                       status:
 *                         type: string
 *                         example: pending
 *                       costumerId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6501b7e6d4a9f1234567890
 *                           firstName:
 *                             type: string
 *                             example: John
 *                           surnName:
 *                             type: string
 *                             example: Doe
 *                       riderId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6501d7f6d4a9f1234567890
 *                           firstName:
 *                             type: string
 *                             example: Mary
 *                           surnName:
 *                             type: string
 *                             example: Smith
 *       404:
 *         description: No requests found
 *       403:
 *         description: Forbidden - only admins can fetch all requests
 *       500:
 *         description: Internal server error
 */
router.get('/all', authenticateUser, authorizedUser("admin"), request.getAllRequest);

/**
 * @swagger
 * /request/single/{id}:
 *   delete:
 *     summary: Delete a single delivery request
 *     description: Deletes a delivery request by its ID. Only admins can perform this action.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the delivery request to delete
 *         schema:
 *           type: string
 *           example: 6521dcbf8d4a9f1234567890
 *     responses:
 *       200:
 *         description: Request successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request has been successfully deleted
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: this request is not available
 *       403:
 *         description: Forbidden - only admins can delete requests
 *       500:
 *         description: Internal server error
 */
router.delete('/single/:id', authenticateUser, authorizedUser, request.deleteSingleRequest);

/**
 * @swagger
 * /request/location/{id}:
 *   put:
 *     summary: Update rider location for a delivery request
 *     description: Allows a rider to update their current latitude and longitude for a specific request.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the delivery request
 *         schema:
 *           type: string
 *           example: 6521dcbf8d4a9f1234567890
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 6.5244
 *               longitude:
 *                 type: number
 *                 example: 3.3792
 *     responses:
 *       200:
 *         description: Rider location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Location updated successfully
 *                 request:
 *                   type: object
 *                   description: Updated request document
 *       400:
 *         description: Latitude and longitude required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Latitude and longitude are required
 *       404:
 *         description: Request not found or not assigned to this rider
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request not found or not assigned to this rider
 *       500:
 *         description: Internal server error
 */
router.put( '/location/:id',authenticateUser,authorizedUser('rider'),request.updateRiderLocation)

/**
 * @swagger
 * /request/track/{id}:
 *   get:
 *     summary: Track rider location
 *     description: Allows a costumer to track the current location (latitude, longitude) of the rider assigned to their request.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the delivery request
 *         schema:
 *           type: string
 *           example: 6521dcbf8d4a9f1234567890
 *     responses:
 *       200:
 *         description: Rider location retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Rider location retrieved successfully
 *                 location:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 6.5244
 *                     longitude:
 *                       type: number
 *                       example: 3.3792
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request not found
 *       500:
 *         description: Internal server error
 */
router.get('/track/:id',authenticateUser, authorizedUser('costumer'), request.trackRiderLocation);
module.exports = router;