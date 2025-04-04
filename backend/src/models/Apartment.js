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
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Apartment', apartmentSchema);
