const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String },
  profileImage: { type: String }
}, { timestamps: true });

profileSchema.index({ userId: 1 });

module.exports = mongoose.model('Profile', profileSchema);
