const mongoose = require('mongoose');

const scannedContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scannerName: {
      type: String,
      required: true,
    },
    scannerMobile: {
      type: String,
      required: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScannedContact', scannedContactSchema);
