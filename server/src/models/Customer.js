const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
