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
} = require('../controllers/admin.controller');

const router = express.Router();

router.use(protect);
router.use(isAdmin);

router.route('/profile').get(getAdminProfile).put(updateAdminProfile);
router.route('/users').get(getAllUsers).post(createUser);
router.route('/users/:id').put(updateUser);
router.route('/users/:id/status').put(updateUserStatus);
router.route('/users/:id/scanned').get(getUserScannedContacts);

module.exports = router;
