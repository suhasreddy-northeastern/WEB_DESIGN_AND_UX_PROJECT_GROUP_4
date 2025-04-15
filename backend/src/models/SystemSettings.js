const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  // Key to identify the setting
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Flexible value stored as JSON
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // For tracking when settings were last updated
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);