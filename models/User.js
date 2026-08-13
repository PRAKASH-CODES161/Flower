const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date }
}, { timestamps: true });

userSchema.index({ mobileNumber: 1 });

module.exports = mongoose.model('User', userSchema);
