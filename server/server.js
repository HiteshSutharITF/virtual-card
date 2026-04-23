const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || process.env.npm_lifecycle_event === 'dev';

const envPath = isDev 
  ? path.join(__dirname, '.env.development')
  : path.join(__dirname, '.env');

require('dotenv').config({ path: envPath });

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

logger.info(`Environment: ${isDev ? 'Development' : 'Production'} (Loaded ${path.basename(envPath)})`);
const whatsappService = require('./services/whatsapp.service');
const Admin = require('./models/Admin.model');

// Connect to Database
connectDB();

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

global.io = io; // Make io globally accessible

io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Auto-reconnect WhatsApp if a session was previously active
  try {
    const admin = await Admin.findOne();
    if (admin && admin.whatsappStatus === 'connected') {
      logger.info('Restoring previous WhatsApp session...');
      await whatsappService.initialize();
    }
  } catch (error) {
    logger.error('Error during WhatsApp auto-reconnect:', error);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // In production, we might want to stay alive, but typically it's safer to crash and let PM2 restart
  // server.close(() => process.exit(1)); 
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
