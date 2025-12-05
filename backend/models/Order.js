// backend/models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  price: Number,
  qty: { type: Number, default: 1 },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  amount: { type: Number, required: true }, // rupees
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: { type: String, default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
