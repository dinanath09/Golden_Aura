// backend/models/Product.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    type: {
      type: String,
      required: true,
      enum: ["Attar", "Spray", "Solid Perfume", "Perfume Candle"],
      default: "Spray",
    },

    description: { type: String, default: "" },
    category: { type: String, default: "Unisex" },
    price: { type: Number, required: true, min: 0 },

    // 🔹 Brand info (used in invoice & admin UI)
    brand: {
      name: { type: String, required: false, trim: true },
      country: { type: String, default: "India" },
      description: { type: String, default: "" },
    },

    images: [
      {
        url: { type: String, default: "/no-image.jpg" },
        public_id: { type: String },
      },
    ],

    stock: { type: Number, default: 0, min: 0 },

    rating: { type: Number, default: 0, min: 0, max: 5 },

    reviews: [reviewSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
