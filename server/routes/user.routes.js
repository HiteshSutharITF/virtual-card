const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { isUser } = require('../middlewares/role.middleware');
const {
  getUserProfile,
  updateUserProfile,
  getScannedContacts,
} = require('../controllers/user.controller');

const router = express.Router();

router.use(protect);
router.use(isUser);

router.route('/profile').get(getUserProfile).put(updateUserProfile);
router.route('/scanned').get(getScannedContacts);

module.exports = router;
