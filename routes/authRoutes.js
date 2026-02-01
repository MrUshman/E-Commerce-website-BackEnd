const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// --- SETUP ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// --- 🚀 SIGNUP (Updated for identifier, firstName, lastName) ---
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, identifier, password } = req.body;
    const cleanIdentifier = identifier.trim(); 

    // ✅ Naya logic: Ab email/phone ki query 'identifier' field me hogi
    const userExists = await User.findOne({ identifier: cleanIdentifier });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Naye Schema ke hisaab se data save
    const user = await User.create({
      firstName,
      lastName,
      identifier: cleanIdentifier,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false
    });

    // Send OTP (Email check logic)
    if (cleanIdentifier.includes('@')) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER, 
          to: cleanIdentifier, 
          subject: 'Your ZAMS OTP', 
          html: `<h1 style="color:#06b6d4;">${otp}</h1>`
        });
      } catch (e) { console.log("Email failed, OTP is:", otp); }
    } else {
      console.log(`Phone OTP: ${otp}`);
    }

    res.status(201).json({ message: 'OTP Sent' });

  } catch (error) { 
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message }); 
  }
});

// --- 🔑 VERIFY OTP (Updated) ---
router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const cleanIdentifier = identifier.trim();
    
    // Identifier se user dhundho
    const user = await User.findOne({ identifier: cleanIdentifier });
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    if (user.otp === otp) {
      user.isVerified = true; 
      user.otp = undefined; 
      user.otpExpires = undefined;
      await user.save();

      res.json({ 
        _id: user._id, 
        name: user.firstName, // Frontend ko sirf first name bhejo
        token: generateToken(user._id), 
        isAdmin: user.isAdmin 
      });
    } else { 
      res.status(400).json({ message: 'Invalid OTP' }); 
    }
  } catch (error) { 
    res.status(500).json({ message: 'Verification Error' }); 
  }
});

// --- 🕵️‍♂️ LOGIN (Updated) ---
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const cleanIdentifier = identifier.trim();

    // Query naye 'identifier' field par
    const user = await User.findOne({ identifier: cleanIdentifier });

    if (!user) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Account not verified' });
    }

    res.json({
      _id: user._id,
      name: user.firstName,
      identifier: user.identifier,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;