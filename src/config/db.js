// connect to mongodb
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || typeof uri !== "string") {
    console.error("MongoDB connection error: MONGODB_URI is missing. Set it in .env (local) or Environment (Render).");
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 50,
      minPoolSize: 10,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
