const router = require('express').Router();
const Ad = require('../models/Ad');
const multer = require('multer');
const path = require('path');

// --- MULTER CONFIG (Image Upload) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, "ad-" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 1. ADD NEW AD
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, description, theme } = req.body;
    
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const imagePath = req.file.path.replace(/\\/g, "/");

    const newAd = new Ad({
      title, 
      subtitle, 
      description, 
      theme,
      image: imagePath
    });

    const savedAd = await newAd.save();
    res.status(201).json(savedAd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET ALL ADS
router.get('/', async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 }); // Latest first
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DELETE AD
router.delete('/:id', async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.id);
    res.json({ message: "Ad deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;