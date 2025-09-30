const express = require('express');
const authenticateUser = require('../services/authenticateUser');
const authorizedUser = require('../services/authorizeUser');
const request = require('../controller/requestcontroller');
const router = express.Router()

router.post('/create',authenticateUser, authorizedUser('costumer'), request.createdeliveryrequest);
router.get('/',authenticateUser, authorizedUser('rider'), request.getAvailableRequests);
router.put('/accept/:id',authenticateUser, authorizedUser('rider'), request.acceptRequest);
router.patch('/:id',authenticateUser, authorizedUser('rider'), request.updateStatus);
router.get('/analytics',authenticateUser,authorizedUser('admin'), request.getAnalytics);
router.get('/single/:id', authenticateUser, authorizedUser("admin"), request.getSingleRequest);
router.get('/all', authenticateUser, authorizedUser("admin"), request.getAllRequest);
router.delete('/single/:id', authenticateUser, authorizedUser, request.deleteSingleRequest);
router.put( '/location/:id',authenticateUser,authorizedUser('rider'),request.updateRiderLocation)
router.get('/track/:id',authenticateUser, authorizedUser('costumer'), request.trackRiderLocation);
module.exports = router;