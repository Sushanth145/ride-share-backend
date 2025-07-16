const mongoose = require('mongoose');

const RideRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: {
    lat: Number,
    lng: Number,
  },
  to: {
    lat: Number,
    lng: Number,
  },
  matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fare: { type: Number },
  status: { type: String, enum: ['pending', 'matched', 'confirmed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RideRequest', RideRequestSchema);
