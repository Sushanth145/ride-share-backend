const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String },
  gender: { type: String },
});

module.exports = mongoose.model('User', UserSchema);
