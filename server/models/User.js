const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'wholesale', 'admin'], default: 'customer' },
  loyaltyPoints: { type: Number, default: 0 },
  name: { type: String, required: true },
  phone: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
