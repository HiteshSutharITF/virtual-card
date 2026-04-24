const User = require('../models/User.model');
const ScannedContact = require('../models/ScannedContact.model');
const { getSubfolder } = require('../middlewares/upload.middleware');
const logger = require('../utils/logger');

// @desc    Get User Profile
// @route   GET /api/user/profile
const getUserProfile = async (req, res) => {
  const Admin = require('../models/Admin.model');
  const admin = await Admin.findOne();
  res.json({ 
    success: true, 
    data: { 
      ...req.user.toObject(), 
      role: req.user.role || 'user',
      adminMobile: admin?.mobile || '' 
    } 
  });
};

// @desc    Update User Profile
// @route   PUT /api/user/profile
const updateUserProfile = async (req, res) => {
  const { name, mobile, businessName, password, customMessage, isActive, isContactSharingEnabled, logo } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = name || user.name;
      user.mobile = mobile || user.mobile;
      user.businessName = businessName || user.businessName;
      user.customMessage = customMessage !== undefined ? customMessage : user.customMessage;
      user.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : user.isActive;
      user.isContactSharingEnabled = isContactSharingEnabled !== undefined ? (isContactSharingEnabled === 'true' || isContactSharingEnabled === true) : user.isContactSharingEnabled;
      
      if (req.file) {
        const subfolder = getSubfolder(req.file.fieldname);
        user.logo = `/uploads/${subfolder}/${req.file.filename}`;
      } else if (logo === '') {
        user.logo = '';
      }

      if (password) {
        user.password = password;
      }

      const updatedUser = await user.save();
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    logger.error(`Update User Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get User Scanned Contacts
// @route   GET /api/user/scanned
const getScannedContacts = async (req, res) => {
  try {
    const contacts = await ScannedContact.find({ userId: req.user._id }).sort({ scannedAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    logger.error(`Get Scanned Contacts Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getScannedContacts,
};
