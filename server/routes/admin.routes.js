const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const {
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
} = require('../controllers/admin.controller');

const { upload } = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(protect);
router.use(isAdmin);

router.route('/profile').get(getAdminProfile).put(updateAdminProfile);
router.route('/users').get(getAllUsers).post(createUser);
router.route('/users/:id').put(updateUser);
router.route('/users/:id/status').put(updateUserStatus);
router.route('/users/:id/scanned').get(getUserScannedContacts);
router.route('/users/:id/referrals').get(getReferralsByUserId);
router.route('/users/:id/payment').post(upload.single('receiptImage'), addPayment);
router.route('/users/:id/expiry').put(updateSubscriptionExpiry);
router.route('/otp-logs').get(getOtpLogs).delete(deleteAllOtpLogs);
router.route('/settings').get(getGlobalSettings).put(updateGlobalSettings);
router.route('/subscriptions').get(getAllSubscriptions);

module.exports = router;
