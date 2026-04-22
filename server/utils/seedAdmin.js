require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Admin = require('../models/Admin.model');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    const adminExists = await Admin.findOne({ email: 'admin@example.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    await Admin.create({
      name: 'Super Admin',
      email: 'admin@example.com',
      mobile: '1234567890',
      password: 'password123', // Will be hashed by pre-save hook
      whatsappStatus: 'disconnected',
    });

    console.log('Admin seeded successfully: admin@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
