const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const generateAlphanumericToken = (length = 6) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous characters like 0, O, I, 1
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

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
      default: () => generateAlphanumericToken(),
    },
    customMessage: {
      type: String,
      default: 'Hi {name}! Thanks for connecting.',
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
    logo: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user'],
      default: 'user',
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
