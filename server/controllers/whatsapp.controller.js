const whatsappService = require('../services/whatsapp.service');

// @desc    Connect WhatsApp
// @route   POST /api/whatsapp/connect
const connectWhatsApp = async (req, res) => {
  try {
    await whatsappService.initialize();
    res.json({ success: true, message: 'WhatsApp initialization started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get WhatsApp Status
// @route   GET /api/whatsapp/status
const getWhatsAppStatus = (req, res) => {
  res.json({ success: true, data: whatsappService.getStatus() });
};

// @desc    Disconnect WhatsApp
// @route   POST /api/whatsapp/disconnect
const disconnectWhatsApp = async (req, res) => {
  try {
    await whatsappService.disconnect();
    res.json({ success: true, message: 'WhatsApp disconnected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  connectWhatsApp,
  getWhatsAppStatus,
  disconnectWhatsApp,
};
