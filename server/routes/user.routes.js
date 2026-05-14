const express = require('express');
const { protect, checkSubscription } = require('../middlewares/auth.middleware');
const { isUser } = require('../middlewares/role.middleware');
const {
  getUserProfile,
  updateUserProfile,
  getScannedContacts,
  updateScannedContact,
  exportScannedContacts,
  getAffiliateStats,
  updateAffiliateTemplates,
} = require('../controllers/user.controller');

const { upload } = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(protect);
router.use(isUser);
router.use(checkSubscription);

router.route('/profile')
  .get(getUserProfile)
  .put(upload.single('logo'), updateUserProfile);
router.route('/scanned').get(getScannedContacts);
router.route('/scanned/:id').put(updateScannedContact);
router.route('/scanned/export').get(exportScannedContacts);
router.route('/affiliate/stats').get(getAffiliateStats);
router.route('/affiliate/templates').put(updateAffiliateTemplates);

module.exports = router;
