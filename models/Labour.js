const mongoose = require('mongoose');

const labourSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labourName: { type: String, required: true },
  wageAmount: { type: Number, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

labourSchema.index({ userId: 1 });
labourSchema.index({ date: 1 });

module.exports = mongoose.model('Labour', labourSchema);
