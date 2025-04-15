// models/Tour.js
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  brokerEmail: {
    type: String,
    required: true,
  },
  apartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  tourDate: {
    type: Date,
    required: true,
  },
  tourTime: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rescheduled', 'completed', 'canceled'],
    default: 'pending',
  },
  brokerResponse: {
    type: String,
    default: null,
  },
  userCanceled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt timestamp before saving
tourSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Tour', tourSchema);