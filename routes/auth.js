const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateOTP, verifyOTP } = require('../utils/otp');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "test_secret";

// Step 1: Request OTP
router.post('/request-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });
  generateOTP(phone);
  res.json({ message: 'OTP sent (check console for now)' });
});

// Step 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phone, otp, name, gender } = req.body;
  if (!verifyOTP(phone, otp)) return res.status(400).json({ error: 'Invalid OTP' });

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, name, gender });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

module.exports = router;
