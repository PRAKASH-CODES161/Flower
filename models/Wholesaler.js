const mongoose = require('mongoose');

const wholesalerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String },
  totalPurchase: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 }
}, { timestamps: true });

wholesalerSchema.index({ userId: 1 });
wholesalerSchema.index({ mobileNumber: 1 });

module.exports = mongoose.model('Wholesaler', wholesalerSchema);
