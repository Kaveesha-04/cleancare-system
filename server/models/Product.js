const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, default: "General" },
  section: { type: String, default: "General" },
  price: { type: Number, required: true },
  wholesalePrice: { type: Number },
  stock: { type: Number, default: 0 },
  barcode: { type: String, unique: true, sparse: true },
  image: { type: String },
  retailDiscount: { type: Number, default: 0 },
  wholesaleDiscount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
