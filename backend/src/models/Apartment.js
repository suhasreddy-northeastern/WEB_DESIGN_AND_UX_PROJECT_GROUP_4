//models/Apartment.js
const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  type: String,
  bedrooms: String,
  price: Number,
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
  imageUrls: [String],
  // Add location data
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      type: String,
      default: ''
    }
  },
  // Add broker fields
  brokerEmail: {
    type: String,
    required: true
  },
  broker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Make sure your User model is named 'User'
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add a 2dsphere index for geospatial queries
apartmentSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model('Apartment', apartmentSchema);