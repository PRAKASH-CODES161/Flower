const mongoose = require('mongoose');

const salesItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower', required: true },
  quantity: { type: Number, required: true },
  sellingPrice: { type: Number, required: true }
}, { timestamps: true });

salesItemSchema.index({ userId: 1 });
salesItemSchema.index({ billId: 1 });

module.exports = mongoose.model('SalesItem', salesItemSchema);
