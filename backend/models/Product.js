const mongoose = require("mongoose");

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
    // images: array of objects { url, public_id? } — url is optional to avoid strict validation errors
    images: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
