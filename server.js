const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); 
const path = require('path');
const cartRoutes = require('./routes/cartRoutes');

// --- ROUTES IMPORTS ---
// 🚨 NOTE: Ensure your file is named 'authRoutes.js' in the routes folder
const authRoutes = require('./routes/authRoutes'); 
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adRoutes = require('./routes/adRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

// Config
dotenv.config();
connectDB(); 

const app = express();

// --- MIDDLEWARES ---
app.use(cors());



// Limit increased for high-quality product images and screenshots
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- STATIC FOLDERS ---
// Isse frontend aapki images access kar payega (e.g., http://localhost:5000/uploads/image.jpg)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);       
app.use('/api/products', productRoutes); 
app.use('/api/orders', orderRoutes);    
app.use('/api/ads', adRoutes);          

// --- BASIC API CHECK ---
app.get('/', (req, res) => {
  res.send('🚀 Zams Fashion API is Running Fine...');
});

// --- GLOBAL ERROR HANDLER ---
// Agar kisi route mein error aata hai, toh server crash nahi hoga
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server!" });
});

// --- SERVER START ---
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`
//   ✅ Server is fired up!
//   📡 Port: ${PORT}
//   🔗 URL: http://localhost:${PORT}
//   `);
// });

module.exports = app; // Exporting app for external use (e.g., testing)