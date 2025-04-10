const express = require('express');
const router = express.Router();
const {registerUser,loginUser,logoutUser} = require('../controllers/authController');
// const authController = require('../controllers/authController');

//register
// router.post('/register', authController.handleNewUser);
router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/logout',logoutUser);
module.exports = router;