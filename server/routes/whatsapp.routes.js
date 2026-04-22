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
router.use(isAdmin);

router.get('/status', getWhatsAppStatus);
router.post('/connect', connectWhatsApp);
router.post('/disconnect', disconnectWhatsApp);

module.exports = router;
