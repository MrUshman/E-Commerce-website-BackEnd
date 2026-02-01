const User = require('../models/User'); // Check karna path sahi ho
// const bcrypt = require('bcryptjs'); // Agar password hash kar rahe ho toh

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, identifier, password } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ identifier });
    if (userExists) {
      return res.status(400).json({ message: "User already registered with this Email/Phone" });
    }

    // 2. Create New User (Hamare naye schema ke hisaab se)
    const user = new User({
      firstName,
      lastName,
      identifier,
      password, // Ideal case mein: await bcrypt.hash(password, 10)
      isVerified: false,
      otp: "123456" // Abhi ke liye dummy OTP, baad mein dynamic karenge
    });

    await user.save();

    res.status(201).json({ 
      message: "Signup successful! Check console for OTP.",
      identifier: user.identifier 
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const user = await User.findOne({ identifier });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = undefined; // OTP verify hone ke baad delete kar do
    await user.save();

    // Yahan aap Token (JWT) bhej sakte hain login karwane ke liye
    res.status(200).json({ 
      message: "Verified successfully!",
      name: user.firstName,
      isAdmin: user.isAdmin 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};