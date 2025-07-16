const otpGenerator = require('otp-generator');

const otpStore = {}; // In-memory: phone => otp

function generateOTP(phone) {
  const otp = otpGenerator.generate(6, { digits: true, alphabets: false });
  otpStore[phone] = otp;
  console.log(`OTP for ${phone}: ${otp}`);
  setTimeout(() => delete otpStore[phone], 5 * 60 * 1000); // auto-expire
  return otp;
}

function verifyOTP(phone, otp) {
  return otpStore[phone] === otp;
}

module.exports = { generateOTP, verifyOTP };
