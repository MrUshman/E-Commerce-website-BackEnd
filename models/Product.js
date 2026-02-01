const mongoose = require('mongoose');

// ✅ NEW: Review Schema (Har product ke liye alag reviews honge)
const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // User model se connect rahega
    },
    name: { type: String, required: true }, // Reviewer ka naam
    rating: { type: Number, required: true }, // 1-5 stars
    comment: { type: String, required: true }, // Review text
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    specifications: { type: String }, 
    price: { type: Number, required: true }, 
    mrp: { type: Number }, 
    category: { type: String, required: true },
    stock: { type: Number, required: true },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    
    // ✅ UPDATED: Ab ye real reviews se connect hoga
    reviews: [reviewSchema], 
    rating: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    numReviews: { 
        type: Number, 
        required: true, 
        default: 0 
    },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);