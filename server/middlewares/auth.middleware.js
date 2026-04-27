const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try fetching as Admin first
      let account = await Admin.findById(decoded.id).select('-password');
      let role = 'admin';

      if (!account) {
        // Fetch as User
        account = await User.findById(decoded.id).select('-password');
        role = 'user';
      }

      if (!account) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      // If user is not approved, block access (except for getting profile/status)
      if (role === 'user' && account.status !== 'approved' && req.originalUrl !== '/api/user/profile') {
        return res.status(403).json({ success: false, message: 'Account pending approval or rejected' });
      }

      req.user = account;
      req.user.role = role;
      next();
    } catch (error) {
      logger.error(`Auth Error: ${error.message}`);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const checkSubscription = (req, res, next) => {
  if (req.user.role === 'user') {
    const now = new Date();
    const expiry = new Date(req.user.subscriptionExpiresAt);

    if (expiry < now) {
      // Allow profile and affiliate stats even if expired
      const allowedPaths = ['/api/user/profile', '/api/user/affiliate/stats'];
      if (!allowedPaths.includes(req.originalUrl)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Your subscription has ended. Please contact admin info@itfuturz.com' 
        });
      }
    }
  }
  next();
};

module.exports = { protect, checkSubscription };
