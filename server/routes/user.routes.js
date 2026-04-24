const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { isUser } = require('../middlewares/role.middleware');
const {
  getUserProfile,
  updateUserProfile,
  getScannedContacts,
  exportScannedContacts,
} = require('../controllers/user.controller');

const { upload } = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(protect);
router.use(isUser);

router.route('/profile')
  .get(getUserProfile)
  .put(upload.single('logo'), updateUserProfile);
router.route('/scanned').get(getScannedContacts);
router.route('/scanned/export').get(exportScannedContacts);

module.exports = router;
