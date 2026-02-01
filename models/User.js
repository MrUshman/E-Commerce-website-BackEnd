const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  
  identifier: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },

  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  
  // Cart logic
  cart: [
    {
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
      },
      qty: { 
        type: Number, 
        default: 1 
      }
    }
  ],

  // ✅ NEW: Wishlist Logic
  // Isme sirf Product ki IDs rahengi
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],

  otp: { type: String },
  otpExpires: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);