const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expenseType: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

expenseSchema.index({ userId: 1 });
expenseSchema.index({ date: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
