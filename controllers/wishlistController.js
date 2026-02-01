const User = require('../models/User');

// 1. User ki Wishlist fetch karna
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: "Wishlist fetch error" });
  }
};

// 2. Wishlist mein Add ya Remove karna (Toggle Logic)
exports.toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    
    // Check karo kya product pehle se wishlist mein hai?
    const isExist = user.wishlist.includes(productId);

    if (isExist) {
      // Agar hai toh nikal do (Unlike)
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    } else {
      // Nahi hai toh dalo (Like)
      user.wishlist.push(productId);
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json(updatedUser.wishlist);
  } catch (error) {
    res.status(500).json({ message: "Wishlist update error" });
  }
};