const express = require('express');
const { adminLogin, userLogin, registerUser, sendOTP, verifyOTP, forgotPassword } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/admin/login', adminLogin);
router.post('/user/login', userLogin);
router.post('/register', registerUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);

module.exports = router;
