const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware'); // Middleware check karna

router.route('/')
  .get(protect, getCart)
  .post(protect, addToCart);

router.route('/:id').delete(protect, removeFromCart);

module.exports = router;