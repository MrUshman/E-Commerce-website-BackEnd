const router = require('express').Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');

// --- EMAIL CONFIGURATION (Bilkul Sahi) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'khanusmann223@gmail.com', // <--- Aapka Email
    pass: 'aalsnupgknmwvdxt'     // <--- Aapka App Password
  }
});

// Helper Function: Check karo input Email hai ya Phone
const isEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

// 1. SIGNUP STEP 1: SEND OTP
router.post('/signup-init', async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    
    // Check User Existence
    const userExists = await User.findOne({ emailOrPhone });
    if (userExists) {
      return res.status(400).json({ message: "User already exists! Please Login." });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP to DB (Purana delete karke naya save karo)
    await Otp.deleteMany({ email: emailOrPhone });
    await new Otp({ email: emailOrPhone, otp }).save();

    // --- LOGIC: EMAIL VS PHONE ---
    if (isEmail(emailOrPhone)) {
      // CASE 1: EMAIL (Send via Nodemailer)
      await transporter.sendMail({
        from: '"Zams Fashion" <khanusmann223@gmail.com>', // Sender Name Fixed
        to: emailOrPhone,
        subject: 'Verify your Signup - Zams Fashion',
        text: `Your OTP for signup is: ${otp}`
      });
      console.log(`✅ Email OTP sent to ${emailOrPhone}`);
      res.status(200).json({ message: "OTP sent to your Email!" });
    } else {
      // CASE 2: PHONE NUMBER (Send via Console Mock)
      console.log(`\n📱 [SMS MOCK] Sending OTP ${otp} to Mobile: ${emailOrPhone}\n`);
      res.status(200).json({ message: "OTP sent to your Mobile! (Check Server Console)" });
    }

  } catch (err) {
    console.error("OTP Error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// 2. SIGNUP STEP 2: VERIFY OTP & CREATE USER
router.post('/signup-verify', async (req, res) => {
  try {
    const { firstName, lastName, emailOrPhone, password, otp } = req.body;

    // Check OTP
    const validOtp = await Otp.findOne({ email: emailOrPhone, otp });
    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or Expired OTP!" });
    }

    // Save User
    const newUser = new User({ 
      firstName, 
      lastName, 
      emailOrPhone, 
      password 
      // Note: Asli app me password hash karna chahiye (bcrypt), par abhi simple rakhte hain
    });
    
    await newUser.save();
    
    // OTP use hone ke baad delete kar do
    await Otp.deleteMany({ email: emailOrPhone });

    res.status(201).json({ message: "User registered successfully!", user: newUser });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Signup Failed" });
  }
});

// 3. LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    const user = await User.findOne({ emailOrPhone });
    
    if (!user) return res.status(404).json({ message: "This Email/Phone is not registered." });
    
    // Simple password check (Hash use kar rahe ho to bcrypt.compare use karna)
    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect Password!" });
    }

    // Send user data (minus password)
    const { password: pass, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;