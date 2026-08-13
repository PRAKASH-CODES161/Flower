const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wholesaler', required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  pendingAmount: { type: Number, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

paymentSchema.index({ userId: 1 });
paymentSchema.index({ wholesalerId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
