const user = require('../controller/usercontroller');
const express = require('express');
const router = express.Router();


router.post('/signUp', user.createUser);
router.post('/login', user.loginUser);
router.get('/all/users', user.getAlluser);
router.get('/costumers', user.getAllCostumer);
router.get('/riders', user.getAllRiders);

module.exports = router;
