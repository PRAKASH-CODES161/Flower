const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  billNumber: { type: String, required: true },
  customerName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  balanceAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

saleSchema.index({ userId: 1 });
saleSchema.index({ billNumber: 1 });
saleSchema.index({ date: 1 });

module.exports = mongoose.model('Sale', saleSchema);
