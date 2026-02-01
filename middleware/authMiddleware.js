const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. PROTECT (Login Check Karne Ke Liye)
const protect = async (req, res, next) => {
  let token;

  // Header me check karo: "Bearer eyJhbGciOiJIUzI1Ni..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // "Bearer " hata kar sirf token nikalo
      token = req.headers.authorization.split(' ')[1];

      // Token Verify karo (JWT_SECRET wahi hona chahiye jo .env me hai)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User dhoond ke req.user me daal do (Password chhod ke)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Sab sahi hai, aage badho
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 2. ADMIN (Admin Check Karne Ke Liye)
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // Haan ye Admin hai, aage jane do
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };