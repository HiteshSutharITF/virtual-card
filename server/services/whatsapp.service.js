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
    this.watchdogInterval = null;
    this.isInitializing = false;
  }

  async initialize() {
    console.log('--- WhatsApp: Starting initialization ---');
    if (this.isInitializing) {
      logger.info('WhatsApp Initialization already in progress, skipping...');
      console.log('WhatsApp: Initialization already in progress, skipping...');
      return;
    }

    this.isInitializing = true;
    
    try {
      if (this.client) {
        logger.info('Existing client found during initialize, destroying...');
        console.log('WhatsApp: Existing client found, destroying before re-init...');
        await this.destroyClient();
      }

      this.status = 'reconnecting';
      this.updateAdminStatus('reconnecting');
      if (global.io) {
        global.io.emit('whatsapp_status', { status: 'reconnecting' });
      }

      logger.info('Initializing WhatsApp Client with enhanced stability options...');
      console.log('WhatsApp: Creating new client instance...');
      
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: process.env.SESSION_PATH || './sessions',
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ],
        },
      });

      this.setupEvents();
      
      console.log('WhatsApp: Calling client.initialize()...');
      await this.client.initialize();
      console.log('WhatsApp: client.initialize() finished.');
      this.startWatchdog();
    } catch (err) {
      logger.error(`WhatsApp Initialization Error: ${err.message}`);
      console.log(`WhatsApp ERROR: Initialization failed: ${err.message}`);
      this.status = 'disconnected';
      this.updateAdminStatus('disconnected');
      setTimeout(() => {
        console.log('WhatsApp: Retrying initialization...');
        this.initialize();
      }, 30000);
    } finally {
      this.isInitializing = false;
    }
  }

  setupEvents() {
    console.log('WhatsApp: Setting up event listeners...');
    this.client.on('qr', async (qr) => {
      logger.info('WhatsApp QR Code Received');
      console.log('WhatsApp: QR Code received, ready to scan.');
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
      console.log('WhatsApp: Client is READY and CONNECTED.');
      this.status = 'connected';
      this.qrCode = '';
      this.updateAdminStatus('connected');
      
      if (global.io) {
        global.io.emit('whatsapp_status', { status: 'connected' });
      }
    });

    this.client.on('authenticated', () => {
      logger.info('WhatsApp Authenticated');
      console.log('WhatsApp: Client Authenticated.');
    });

    this.client.on('auth_failure', (msg) => {
      logger.error(`WhatsApp Auth Failure: ${msg}`);
      console.log(`WhatsApp ERROR: Auth failure: ${msg}`);
      this.status = 'disconnected';
      this.updateAdminStatus('disconnected');
    });

    this.client.on('disconnected', async (reason) => {
      logger.warn(`WhatsApp Disconnected: ${reason}`);
      console.log(`WhatsApp WARNING: Disconnected. Reason: ${reason}`);
      this.status = 'disconnected';
      this.updateAdminStatus('disconnected');
      
      if (global.io) {
        global.io.emit('whatsapp_status', { status: 'disconnected' });
      }
      
      await this.destroyClient();
      
      // Re-initialize after a delay
      console.log('WhatsApp: Attempting re-initialization in 5s...');
      setTimeout(() => this.initialize(), 5000);
    });

    this.client.on('message', async (msg) => {
      console.log(`WhatsApp: Incoming message from ${msg.from}`);
      try {
        await this.handleIncomingMessage(msg);
      } catch (err) {
        logger.error(`Error in message event listener: ${err.message}`);
        console.log(`WhatsApp ERROR: Problem handling message event: ${err.message}`);
      }
    });
  }

  async destroyClient() {
    this.stopWatchdog();
    if (this.client) {
      try {
        logger.info('Destroying existing WhatsApp client...');
        console.log('WhatsApp: Destroying client...');
        await this.client.destroy();
        console.log('WhatsApp: Client destroyed successfully.');
      } catch (err) {
        logger.error(`Error destroying client: ${err.message}`);
        console.log(`WhatsApp ERROR: Failed to destroy client: ${err.message}`);
      }
      this.client = null;
    }
  }

  startWatchdog() {
    this.stopWatchdog();
    logger.info('Starting WhatsApp Watchdog...');
    console.log('WhatsApp: Watchdog started (5min intervals).');
    this.watchdogInterval = setInterval(async () => {
      if (this.status === 'connected' && this.client) {
        try {
          console.log('WhatsApp: Watchdog checking client state...');
          const state = await this.client.getState();
          logger.info(`Watchdog check: Client state is ${state}`);
          console.log(`WhatsApp: Watchdog check result: ${state}`);
          if (!state) {
             throw new Error('Client state is null/undefined');
          }
        } catch (err) {
          logger.error(`Watchdog detected unresponsive client: ${err.message}. Re-initializing...`);
          console.log(`WhatsApp WARNING: Watchdog detected unresponsive client! Error: ${err.message}. Triggering re-init...`);
          this.initialize();
        }
      }
    }, 1000 * 60 * 5); // Check every 5 minutes
  }

  stopWatchdog() {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = null;
      console.log('WhatsApp: Watchdog stopped.');
    }
  }

  async handleIncomingMessage(msg) {
    const body = msg.body ? msg.body.trim() : '';
    if (!body) {
      console.log('WhatsApp: Received empty message body, ignoring.');
      return;
    }
    
    logger.info(`Received message: ${body} from ${msg.from}`);
    console.log(`WhatsApp: Processing message: "${body}"`);

    // Parse Token: token is the last word
    const words = body.split(' ');
    const token = words[words.length - 1];

    if (!token) {
      console.log('WhatsApp: No token found in message body.');
      return;
    }

    try {
      const user = await User.findOne({ userToken: token, isActive: true, status: 'approved' });

      if (user) {
        logger.info(`Valid token found: ${token} for user ${user.name}`);
        console.log(`WhatsApp: Valid token [${token}] found for user [${user.name}]`);

        // 1. Log the scan
        const contact = await msg.getContact();
        console.log(`WhatsApp: Logged scan from ${contact.pushname} (${contact.number})`);
        await ScannedContact.create({
          userId: user._id,
          scannerName: contact.pushname || 'Unknown',
          scannerMobile: contact.number,
        });

        // 2. Share User's Contact to Scanner
        if (user.isContactSharingEnabled) {
          console.log(`WhatsApp: Sharing user contact [${user.name}] with scanner...`);
          const cleanMobile = `91${user.mobile}`;
          const formattedMobile = `${user.mobile.slice(0, 5)} ${user.mobile.slice(5)}`;
          const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${user.name}\nORG:${user.businessName}\nTEL;type=CELL;type=VOICE;waid=${cleanMobile}:+91 ${formattedMobile}\nEND:VCARD`;
          await this.client.sendMessage(msg.from, vcard);
        }

        // 3. Send Custom Message
        let replyMsg = user.customMessage || "Hi {name}! Thanks for connecting.";
        replyMsg = replyMsg.replace(/{name}/g, contact.pushname || 'there');
        console.log(`WhatsApp: Sending reply: "${replyMsg}"`);
        await this.client.sendMessage(msg.from, replyMsg);

        // 4. Share Scanner's Contact to User (QR Holder)
        try {
          console.log(`WhatsApp: Sharing scanner info with the QR holder [${user.mobile}]...`);
          const rawNum = contact.number.startsWith('91') ? contact.number.slice(2) : contact.number;
          const cleanScannerNum = contact.number; // Already has country code from WhatsApp
          const formattedScannerNum = `${rawNum.slice(0, 5)} ${rawNum.slice(5)}`;
          
          const scannerVcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.pushname || 'New Lead'}\nTEL;type=CELL;type=VOICE;waid=${cleanScannerNum}:+91 ${formattedScannerNum}\nEND:VCARD`;
          const ownerJid = `91${user.mobile}@c.us`;
          
          await this.client.sendMessage(ownerJid, `*Action Needed:* New contact scanned your QR!\n*Name:* ${contact.pushname || 'Unknown'}\n*Number:* ${contact.number}`);
          await this.client.sendMessage(ownerJid, scannerVcard);
          logger.info(`Scanner contact shared with holder: ${user.mobile}`);
          console.log(`WhatsApp: Scanner contact shared successfully with holder.`);
        } catch (shareErr) {
          logger.error(`Error sharing scanner contact: ${shareErr.message}`);
          console.log(`WhatsApp ERROR: Failed to share scanner contact with holder: ${shareErr.message}`);
        }
      } else {
        console.log(`WhatsApp: No active/approved user found for token [${token}]`);
      }
    } catch (error) {
      logger.error(`Message Handling Error: ${error.message}`);
      console.log(`WhatsApp ERROR: Exception while processing message: ${error.message}`);
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
      try {
        await this.client.logout();
        await this.destroyClient();
      } catch (err) {
        logger.error(`Error during disconnect: ${err.message}`);
      }
      this.status = 'disconnected';
      this.qrCode = '';
      this.updateAdminStatus('disconnected');
    }
  }
}

module.exports = new WhatsAppService();
