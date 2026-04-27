const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  trialDuration: {
    value: {
      type: Number,
      default: 7
    },
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'days'
    }
  },
  defaultSubscriptionYear: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
