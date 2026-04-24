const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the server root
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User.model');
const Admin = require('../models/Admin.model');

/**
 * Migration Script: Update Existing Users & Admins with Roles
 * 
 * This script ensures all existing documents in the database have the 'role' field
 * assigned according to their collection type. 
 * Run this once after adding 'role' to your Mongoose schemas.
 */
const migrateRoles = async () => {
  try {
    // Check if MONGO_URI is available
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully.');

    // 1. Update Users: Add role 'user' to documents without a role
    console.log('Scanning for users without roles...');
    const userResult = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );
    console.log(`- Role assignment complete for Users. Modified: ${userResult.modifiedCount}`);

    // 2. Update Admins: Add role 'admin' to documents without a role
    console.log('Scanning for admins without roles...');
    const adminResult = await Admin.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'admin' } }
    );
    console.log(`- Role assignment complete for Admins. Modified: ${adminResult.modifiedCount}`);

    console.log('---');
    console.log('Migration Task Finished Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration Task Failed:');
    console.error(error.message);
    process.exit(1);
  }
};

// Execute Migration
migrateRoles();
