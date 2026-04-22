const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business Name is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    userToken: {
      type: String,
      unique: true,
      default: () => uuidv4().split('-')[0].toUpperCase(), // Short unique token
    },
    customMessage: {
      type: String,
      default: 'Hi {name}! Thanks for connecting. Here is my contact info.',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isContactSharingEnabled: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    createdBy: {
      type: String,
      enum: ['admin', 'self'],
      default: 'self',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
