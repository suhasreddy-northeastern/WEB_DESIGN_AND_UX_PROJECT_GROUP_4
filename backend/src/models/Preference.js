const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  userEmail: String,
  type: String,
  bedrooms: String,
  priceRange: String,
  neighborhood: String,
  amenities: [String],
  style: String,
  floor: String,
  moveInDate: Date,
  parking: String,
  transport: String,
  sqft: String,
  safety: String,
  pets: String,
  view: String,
  leaseCapacity: String,
  roommates: String,
  // Add location preference
  locationPreference: {
    center: {
      type: [Number], // [longitude, latitude]
      default: null
    },
    radius: {
      type: Number, // in kilometers
      default: 5
    },
    address: String
  },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Preference', preferenceSchema);