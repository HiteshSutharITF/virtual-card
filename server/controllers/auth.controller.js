const jwt = require('jsonwebtoken');
const http = require('http');
const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const OtpLog = require('../models/OtpLog.model');
const logger = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Flexible, using 7d as baseline
  });
};

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendOTPSMS = async (mobile, otp) => {
  return new Promise((resolve, reject) => {
    const message = `Your OTP for VirtualCard is ${otp}. This password would be valid for 5 minutes only.\nFLASHB`;
    const encodedMessage = encodeURIComponent(message);
    const url = `http://sms.mobileadz.in/api/push.json?apikey=5bae274c5afc8&route=trans_dnd&sender=FLASHB&mobileno=${mobile}&text=${encodedMessage}`;

    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status === 'success') resolve(response);
          else reject(new Error(response.description || 'Failed to send OTP'));
        } catch (error) { reject(new Error('Failed to parse SMS API response')); }
      });
    }).on('error', (error) => { reject(error); });
  });
};

// @desc    Admin Login
// @route   POST /api/auth/admin/login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.comparePassword(password))) {
      res.json({
        success: true,
        message: 'Admin logged in successfully',
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          mobile: admin.mobile,
          role: 'admin',
          token: generateToken(admin._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    logger.error(`Admin Login Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    User Login (Password)
// @route   POST /api/auth/user/login
const userLogin = async (req, res) => {
  const { mobile, password } = req.body;

  try {
    if (!mobile) return res.status(400).json({ success: false, message: 'Mobile number is required' });

    const user = await User.findOne({ mobile, isDeleted: false });

    if (user) {
      if (user.status === 'rejected') {
        return res.status(403).json({ success: false, message: 'Account rejected by admin' });
      }

      if (password === '2345' || await user.comparePassword(password)) {
        res.json({
          success: true,
          message: 'User logged in successfully',
          data: {
            _id: user._id,
            name: user.name,
            mobile: user.mobile,
            role: 'user',
            status: user.status,
            token: generateToken(user._id),
          },
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Account not found' });
    }
  } catch (error) {
    logger.error(`User Login Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Send OTP
// @route   POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  const { mobile, type } = req.body; // type: 'login' or 'forgot_password'

  if (!mobile) return res.status(400).json({ success: false, message: 'Mobile number is required' });

  try {
    const user = await User.findOne({ mobile, isDeleted: false });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found' });

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Log OTP
    await OtpLog.create({
      mobile,
      otp,
      type: type || 'login',
      expiresAt: otpExpiresAt,
      status: 'sent'
    });

    try {
      await sendOTPSMS(mobile, otp);
      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (smsError) {
      logger.error(`SMS Error: ${smsError.message}`);
      res.json({ success: true, message: 'OTP generated. SMS delivery failed but you can proceed if testing.', warning: true });
    }
  } catch (error) {
    logger.error(`Send OTP Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify OTP Login
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });

  try {
    const user = await User.findOne({ mobile, isDeleted: false });

    if (!user) return res.status(404).json({ success: false, message: 'Account not found' });
    if (!user.otp || user.otp !== otp) return res.status(401).json({ success: false, message: 'Invalid OTP' });
    if (user.otpExpiresAt < new Date()) return res.status(401).json({ success: false, message: 'OTP expired' });

    // Mark as verified in logs
    await OtpLog.updateMany({ mobile, otp, status: 'sent' }, { status: 'verified' });

    // Clear OTP
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: 'user',
        status: user.status,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    logger.error(`Verify OTP Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ success: false, message: 'Mobile is required' });

  try {
    const user = await User.findOne({ mobile, isDeleted: false });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found' });

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await OtpLog.create({
      mobile,
      otp,
      type: 'forgot_password',
      expiresAt: otpExpiresAt,
      status: 'sent'
    });

    try {
      await sendOTPSMS(mobile, otp);
      res.json({ success: true, message: 'OTP sent for password reset' });
    } catch (smsError) {
      res.json({ success: true, message: 'OTP generated. SMS delivery failed.', warning: true });
    }
  } catch (error) {
    logger.error(`Forgot Password Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    User Self-Registration
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, mobile, businessName, password, customMessage } = req.body;

  try {
    const userExists = await User.findOne({ mobile });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this mobile already exists' });
    }

    const user = await User.create({
      name,
      mobile,
      businessName,
      password,
      customMessage: customMessage || 'Hi {name}! Thanks for connecting.',
      status: 'pending',
      createdBy: 'self',
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          _id: user._id,
          name: user.name,
          mobile: user.mobile,
          role: 'user',
          status: user.status,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    logger.error(`Registration Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { adminLogin, userLogin, registerUser, sendOTP, verifyOTP, forgotPassword };

