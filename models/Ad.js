
const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  description: { type: String },
  theme: { type: String, default: 'dark' }, // dark ya light theme text ke liye
  image: { type: String, required: true }, // Image URL zaroori hai
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);