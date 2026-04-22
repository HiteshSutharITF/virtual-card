const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const ScannedContact = require('../models/ScannedContact.model');
const logger = require('../utils/logger');

// @desc    Get Admin Profile
// @route   GET /api/admin/profile
const getAdminProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
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
    const users = await User.find({ isDeleted: false }).sort({ createdAt: -1 });
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
  const { name, mobile, businessName, password } = req.body;

  try {
    const userExists = await User.findOne({ mobile });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this mobile number' });
    }

    const user = await User.create({
      name,
      mobile,
      businessName,
      password,
      createdBy: 'admin',
      status: 'approved',
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

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  getAllUsers,
  updateUserStatus,
  getUserScannedContacts,
  createUser,
};
