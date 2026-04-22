const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const User = require('../models/User.model');
const Admin = require('../models/Admin.model');
const ScannedContact = require('../models/ScannedContact.model');
const logger = require('../utils/logger');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.status = 'disconnected';
    this.qrCode = '';
  }

  async initialize() {
    if (this.client) return;

    this.status = 'reconnecting';
    this.updateAdminStatus('reconnecting');
    if (global.io) {
      global.io.emit('whatsapp_status', { status: 'reconnecting' });
    }

    logger.info('Initializing WhatsApp Client...');
    
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: process.env.SESSION_PATH || './sessions',
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    this.setupEvents();
    this.client.initialize().catch((err) => {
      logger.error(`WhatsApp Initialization Error: ${err.message}`);
    });
  }

  setupEvents() {
    this.client.on('qr', async (qr) => {
      logger.info('WhatsApp QR Code Received');
      this.status = 'qr_ready';
      this.qrCode = await qrcode.toDataURL(qr);
      this.updateAdminStatus('qr_ready');
      
      if (global.io) {
        global.io.emit('whatsapp_qr', { qr: this.qrCode });
        global.io.emit('whatsapp_status', { status: 'qr_ready' });
      }
    });

    this.client.on('ready', () => {
      logger.info('WhatsApp Client is ready!');
      this.status = 'connected';
      this.qrCode = '';
      this.updateAdminStatus('connected');
      
      if (global.io) {
        global.io.emit('whatsapp_status', { status: 'connected' });
      }
    });

    this.client.on('authenticated', () => {
      logger.info('WhatsApp Authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      logger.error(`WhatsApp Auth Failure: ${msg}`);
      this.status = 'disconnected';
      this.updateAdminStatus('disconnected');
    });

    this.client.on('disconnected', (reason) => {
      logger.warn(`WhatsApp Disconnected: ${reason}`);
      this.status = 'disconnected';
      this.updateAdminStatus('disconnected');
      
      if (global.io) {
        global.io.emit('whatsapp_status', { status: 'disconnected' });
      }
      
      // Re-initialize after a delay
      setTimeout(() => this.initialize(), 5000);
    });

    this.client.on('message', async (msg) => {
      await this.handleIncomingMessage(msg);
    });
  }

  async handleIncomingMessage(msg) {
    const body = msg.body.trim();
    logger.info(`Received message: ${body} from ${msg.from}`);

    // Parse Token: token is the last word
    const words = body.split(' ');
    const token = words[words.length - 1];

    if (!token) return;

    try {
      const user = await User.findOne({ userToken: token, isActive: true, status: 'approved' });

      if (user) {
        logger.info(`Valid token found: ${token} for user ${user.name}`);

        // 1. Log the scan
        const contact = await msg.getContact();
        await ScannedContact.create({
          userId: user._id,
          scannerName: contact.pushname || 'Unknown',
          scannerMobile: contact.number,
        });

        // 2. Share User's Contact to Scanner
        if (user.isContactSharingEnabled) {
          const cleanMobile = `91${user.mobile}`;
          const formattedMobile = `${user.mobile.slice(0, 5)} ${user.mobile.slice(5)}`;
          const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${user.name}\nORG:${user.businessName}\nTEL;type=CELL;type=VOICE;waid=${cleanMobile}:+91 ${formattedMobile}\nEND:VCARD`;
          await this.client.sendMessage(msg.from, vcard);
        }

        // 3. Send Custom Message
        let replyMsg = user.customMessage || "Hi {name}! Thanks for connecting.";
        replyMsg = replyMsg.replace(/{name}/g, contact.pushname || 'there');
        await this.client.sendMessage(msg.from, replyMsg);

        // 4. Share Scanner's Contact to User (QR Holder)
        try {
          const rawNum = contact.number.startsWith('91') ? contact.number.slice(2) : contact.number;
          const cleanScannerNum = contact.number; // Already has country code from WhatsApp
          const formattedScannerNum = `${rawNum.slice(0, 5)} ${rawNum.slice(5)}`;
          
          const scannerVcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.pushname || 'New Lead'}\nTEL;type=CELL;type=VOICE;waid=${cleanScannerNum}:+91 ${formattedScannerNum}\nEND:VCARD`;
          const ownerJid = `91${user.mobile}@c.us`;
          
          await this.client.sendMessage(ownerJid, `*Action Needed:* New contact scanned your QR!\n*Name:* ${contact.pushname || 'Unknown'}\n*Number:* ${contact.number}`);
          await this.client.sendMessage(ownerJid, scannerVcard);
          logger.info(`Scanner contact shared with holder: ${user.mobile}`);
        } catch (shareErr) {
          logger.error(`Error sharing scanner contact: ${shareErr.message}`);
        }
      }
    } catch (error) {
      logger.error(`Message Handling Error: ${error.message}`);
    }
  }

  async updateAdminStatus(status) {
    try {
      await Admin.updateMany({}, { whatsappStatus: status });
    } catch (err) {
      logger.error(`Update Admin Status Error: ${err.message}`);
    }
  }

  getStatus() {
    return { status: this.status, qr: this.qrCode };
  }

  async disconnect() {
    if (this.client) {
      await this.client.logout();
      await this.client.destroy();
      this.client = null;
      this.status = 'disconnected';
      this.qrCode = '';
      this.updateAdminStatus('disconnected');
    }
  }
}

module.exports = new WhatsAppService();
