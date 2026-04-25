const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Keeping old ID mapping for products if needed
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  subtotal: { type: Number, required: true },
  discountApplied: { type: Number, default: 0 },
  finalTotal: { type: Number, required: true },
  pointsEarned: { type: Number, default: 0 },
  paymentMethod: { type: String, required: true },
  orderType: { type: String, required: true },
  items: [orderItemSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
