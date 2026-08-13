const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  flowerName: { type: String, required: true },
  garlandType: { type: String },
  quantity: { type: Number, required: true },
  deliveryDate: { type: Date, required: true },
  advanceAmount: { type: Number, required: true },
  balanceAmount: { type: Number, required: true },
  status: { type: String, required: true }
}, { timestamps: true });

orderSchema.index({ userId: 1 });
orderSchema.index({ mobileNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
