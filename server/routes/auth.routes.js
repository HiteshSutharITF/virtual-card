const express = require('express');
const { adminLogin, userLogin, registerUser } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/admin/login', adminLogin);
router.post('/user/login', userLogin);
router.post('/register', registerUser);

module.exports = router;
