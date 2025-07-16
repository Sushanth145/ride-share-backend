const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  from: {
    lat: Number,
    lng: Number,
  },
  destinations: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      to: { lat: Number, lng: Number }
    }
  ],
  fares: {
    type: Map, // userId → fare
    of: Number
  },
  confirmedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ride', RideSchema);
