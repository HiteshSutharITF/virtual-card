const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    logger.error(`Target URI: ${process.env.MONGO_URI.split('@').pop()}`); // Log the host part only for security
    process.exit(1);
  }
};

module.exports = connectDB;
