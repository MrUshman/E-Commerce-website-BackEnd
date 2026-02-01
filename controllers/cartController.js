const User = require('../models/User');

// 1. User ka Cart Database se nikalna
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Cart fetch error" });
  }
};

// 2. Database mein item Add ya Update karna
exports.addToCart = async (req, res) => {
  // ✅ Added 'overwrite' to catch replacement logic
  const { productId, qty, overwrite } = req.body; 
  try {
    const user = await User.findById(req.user.id);
    
    const itemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // ✅ FIX: Agar overwrite true hai toh seedha qty set karo (Minus/Plus fix)
      // Warna purane logic ki tarah += qty karo (Add to cart fix)
      if (overwrite) {
        user.cart[itemIndex].qty = qty;
      } else {
        user.cart[itemIndex].qty += qty;
      }
    } else {
      user.cart.push({ product: productId, qty });
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    res.status(200).json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: "Add to cart error" });
  }
};

// 3. Database se item hatana
exports.removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.id);
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    res.status(200).json(updatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: "Remove error" });
  }
};