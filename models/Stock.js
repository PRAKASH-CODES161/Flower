const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower', required: true },
  availableQuantity: { type: Number, required: true },
  unit: { type: String, required: true },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  updatedDate: { type: Date }
}, { timestamps: true });

stockSchema.index({ userId: 1 });
stockSchema.index({ flowerId: 1 });

module.exports = mongoose.model('Stock', stockSchema);
