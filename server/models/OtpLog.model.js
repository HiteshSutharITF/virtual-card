const mongoose = require('mongoose');

const otpLogSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['login', 'forgot_password'],
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'verified', 'expired'],
      default: 'sent',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OtpLog', otpLogSchema);
