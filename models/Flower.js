const mongoose = require('mongoose');

const flowerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flowerName: { type: String, required: true },
  unit: { type: String, required: true },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true }
}, { timestamps: true });

flowerSchema.index({ userId: 1 });

module.exports = mongoose.model('Flower', flowerSchema);
