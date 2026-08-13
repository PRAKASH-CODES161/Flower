const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower', required: true },
  wholesalerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wholesaler', required: true },
  date: { type: Date, default: Date.now },
  quantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  pendingAmount: { type: Number, required: true }
}, { timestamps: true });

purchaseSchema.index({ userId: 1 });
purchaseSchema.index({ flowerId: 1 });
purchaseSchema.index({ wholesalerId: 1 });
purchaseSchema.index({ date: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
