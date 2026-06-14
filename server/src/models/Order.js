const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  orderAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  productCategory: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
