const mongoose = require("mongoose");

const connectDB = async (mongoUri) => {
  try {
    if (!mongoUri) {
      console.warn("⚠️  Missing MONGO_URI in .env file");
      return;
    }

    mongoose.set("strictQuery", true);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:");
    console.error("Error:", err.message);
    console.log("🔁 Retrying connection in 5 seconds...");
    setTimeout(() => connectDB(mongoUri), 5000);
  }
};

module.exports = connectDB;
