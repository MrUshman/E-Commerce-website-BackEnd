
const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true }, // Yahan email ya phone number aayega
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // 5 min baad OTP expire
});

module.exports = mongoose.model("Otp", OtpSchema);