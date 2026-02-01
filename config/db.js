const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection using environment variable
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    throw error; // process.exit hata diya (production-safe)
  }
};

module.exports = connectDB;
