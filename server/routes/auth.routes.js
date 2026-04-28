const express = require('express');
const { adminLogin, registerUser, sendOTP, verifyOTP } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/admin/login', adminLogin);
router.post('/register', registerUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

module.exports = router;
