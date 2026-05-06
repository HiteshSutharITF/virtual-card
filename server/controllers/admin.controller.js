const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const ScannedContact = require('../models/ScannedContact.model');
const OtpLog = require('../models/OtpLog.model');
const Settings = require('../models/Settings.model');
const logger = require('../utils/logger');

// @desc    Get Admin Profile
// @route   GET /api/admin/profile
const getAdminProfile = async (req, res) => {
  res.json({ 
    success: true, 
    data: {
      ...req.user.toObject(),
      role: req.user.role || 'admin'
    } 
  });
};

// @desc    Update Admin Profile
// @route   PUT /api/admin/profile
const updateAdminProfile = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  try {
    const admin = await Admin.findById(req.user._id);

    if (admin) {
      admin.name = name || admin.name;
      admin.email = email || admin.email;
      admin.mobile = mobile || admin.mobile;

      if (password) {
        admin.password = password;
      }

      const updatedAdmin = await admin.save();
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: updatedAdmin._id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          mobile: updatedAdmin.mobile,
          role: 'admin',
          token: admin.generateToken ? admin.generateToken() : undefined,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'Admin not found' });
    }
  } catch (error) {
    logger.error(`Update Admin Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get All Users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'scannedcontacts',
          localField: '_id',
          foreignField: 'userId',
          as: 'scans'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'referredBy',
          foreignField: '_id',
          as: 'referrer'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referrals'
        }
      },
      {
        $addFields: {
          scansCount: { $size: '$scans' },
          referrerName: { $ifNull: [{ $arrayElemAt: ['$referrer.name', 0] }, 'Direct'] },
          referralsCount: { $size: '$referrals' }
        }
      },
      { $project: { scans: 0, referrer: 0, referrals: 0 } },
      { $sort: { createdAt: -1 } }
    ]);
    res.json({ success: true, data: users });
  } catch (error) {
    logger.error(`Get Users Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve/Reject User
// @route   PUT /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.status = status;
      await user.save();
      res.json({ success: true, message: `User status updated to ${status}` });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    logger.error(`Update User Status Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create New User (Admin)
// @route   POST /api/admin/users
const createUser = async (req, res) => {
  const { name, mobile, businessName, customMessage, subscriptionExpiresAt } = req.body;

  try {
    const userExists = await User.findOne({ mobile });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this mobile number' });
    }

    const user = await User.create({
      name,
      mobile,
      businessName,
      customMessage: customMessage || 'Hi {name}! Thanks for connecting.',
      createdBy: 'admin',
      status: 'approved',
      subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Business user created and approved successfully',
        data: {
          _id: user._id,
          name: user.name,
          mobile: user.mobile,
          businessName: user.businessName,
          userToken: user.userToken,
          status: user.status,
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    logger.error(`Admin Create User Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get User Scanned Contacts (For Admin)
// @route   GET /api/admin/users/:id/scanned
const getUserScannedContacts = async (req, res) => {
  try {
    const contacts = await ScannedContact.find({ userId: req.params.id }).sort({ scannedAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    logger.error(`Get User Scanned Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update User (Admin)
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  const { name, mobile, businessName, customMessage, isActive, isContactSharingEnabled, status } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = name || user.name;
      user.mobile = mobile || user.mobile;
      user.businessName = businessName || user.businessName;
      
      if (customMessage !== undefined) user.customMessage = customMessage;
      if (isActive !== undefined) user.isActive = isActive;
      if (isContactSharingEnabled !== undefined) user.isContactSharingEnabled = isContactSharingEnabled;
      if (status !== undefined) user.status = status;



      await user.save();
      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          _id: user._id,
          name: user.name,
          mobile: user.mobile,
          businessName: user.businessName,
          status: user.status,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    logger.error(`Admin Update User Error: ${error.message}`);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Mobile number or Email already in use' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get OTP Logs
// @route   GET /api/admin/otp-logs
const getOtpLogs = async (req, res) => {
  try {
    const logs = await OtpLog.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'mobile',
          foreignField: 'mobile',
          as: 'user'
        }
      },
      {
        $addFields: {
          userName: { $ifNull: [{ $arrayElemAt: ['$user.name', 0] }, 'Guest/System'] }
        }
      },
      { $project: { user: 0 } },
      { $sort: { createdAt: -1 } },
      { $limit: 100 }
    ]);
    res.json({ success: true, data: logs });
  } catch (error) {
    logger.error(`Get OTP Logs Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete All OTP Logs
// @route   DELETE /api/admin/otp-logs
const deleteAllOtpLogs = async (req, res) => {
  try {
    await OtpLog.deleteMany({});
    res.json({ success: true, message: 'All OTP logs cleared successfully' });
  } catch (error) {
    logger.error(`Delete OTP Logs Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Referrals by User ID
// @route   GET /api/admin/users/:id/referrals
const getReferralsByUserId = async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.params.id, isDeleted: false }).sort({ createdAt: -1 });
    res.json({ success: true, data: referrals });
  } catch (error) {
    logger.error(`Get Referrals Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Global Settings
// @route   GET /api/admin/settings
const getGlobalSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne() || await Settings.create({});
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update Global Settings
// @route   PUT /api/admin/settings
const updateGlobalSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({ success: true, data: settings, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get All Subscriptions (Earnings)
// @route   GET /api/admin/subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }, 'name mobile businessName subscriptionExpiresAt payments status')
      .sort({ subscriptionExpiresAt: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add Payment and Extend Subscription
// @route   POST /api/admin/users/:id/payment
const addPayment = async (req, res) => {
  const { amount, description, status, durationValue, durationUnit } = req.body;
  let receiptImage = '';

  if (req.file) {
    receiptImage = `/uploads/${req.file.filename}`;
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Add payment record
    user.payments.push({ 
      amount: parseFloat(amount) || 0, 
      description, 
      status, 
      receiptImage, 
      date: new Date() 
    });

    // Extend subscription if status is done
    if (status === 'done') {
      const currentExpiry = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date() 
        ? new Date(user.subscriptionExpiresAt) 
        : new Date();
      
      const newExpiry = new Date(currentExpiry);
      if (durationUnit === 'minutes') newExpiry.setMinutes(newExpiry.getMinutes() + parseInt(durationValue));
      else if (durationUnit === 'hours') newExpiry.setHours(newExpiry.getHours() + parseInt(durationValue));
      else if (durationUnit === 'days') newExpiry.setDate(newExpiry.getDate() + parseInt(durationValue));
      else if (durationUnit === 'years') newExpiry.setFullYear(newExpiry.getFullYear() + parseInt(durationValue));

      user.subscriptionExpiresAt = newExpiry;
    }

    await user.save();
    res.json({ success: true, message: 'Payment added and subscription updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update Subscription Expiry Directly
// @route   PUT /api/admin/users/:id/expiry
const updateSubscriptionExpiry = async (req, res) => {
  const { expiryDate } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.subscriptionExpiresAt = new Date(expiryDate);
    await user.save();
    res.json({ success: true, message: 'Subscription expiry updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  getAllUsers,
  updateUserStatus,
  getUserScannedContacts,
  createUser,
  updateUser,
  getOtpLogs,
  deleteAllOtpLogs,
  getReferralsByUserId,
  getGlobalSettings,
  updateGlobalSettings,
  getAllSubscriptions,
  addPayment,
  updateSubscriptionExpiry,
};
