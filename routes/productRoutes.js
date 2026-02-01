const router = require('express').Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware'); // ✅ Added for Review Security

// --- MULTER CONFIG (Image Upload) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// 1. ADD PRODUCT (Aapka purana code)
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, specifications, price, mrp, category, stock } = req.body;
    const imagePaths = req.files.map(file => file.path.replace(/\\/g, "/"));
    const newProduct = new Product({
      name, description, specifications,
      price: Number(price), mrp: Number(mrp),
      category, stock: Number(stock),
      images: imagePaths, isActive: true 
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. GET ALL PRODUCTS (Aapka purana code)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. GET SINGLE PRODUCT (Aapka purana code)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ✅ NEW: CREATE PRODUCT REVIEW (Amazon/Flipkart Style Logic)
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user already reviewed
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: "Product already reviewed" });
      }

      const review = {
        name: req.user.firstName + " " + req.user.lastName,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;

      // Calculate Average Rating
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. UPDATE PRODUCT (Aapka purana code)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// 5. DELETE PRODUCT (Aapka purana code)
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product Deleted Successfully" });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;