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
  // Add broker fields
  brokerEmail: {
    type: String,
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

module.exports = mongoose.model('Apartment', apartmentSchema);