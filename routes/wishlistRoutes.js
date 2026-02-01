const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getWishlist)    // Wishlist dekhne ke liye
  .post(protect, toggleWishlist); // Add/Remove karne ke liye

module.exports = router;