const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const {
  connectWhatsApp,
  getWhatsAppStatus,
  disconnectWhatsApp,
} = require('../controllers/whatsapp.controller');

const router = express.Router();

router.use(protect);

router.get('/status', getWhatsAppStatus);

// Restricted to Admins only
router.post('/connect', isAdmin, connectWhatsApp);
router.post('/disconnect', isAdmin, disconnectWhatsApp);

module.exports = router;
