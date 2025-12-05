// backend/models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    title: String,        // match frontend payloadItems
    price: Number,
    qty: { type: Number, default: 1 },
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    pincode: String,
    address: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

    items: [orderItemSchema],

    amount: { type: Number, required: true }, // rupees

    delivery: deliverySchema,

    razorpayOrderId: String,
    razorpayPaymentId: String,

    status: { type: String, default: "pending" }, // pending | paid | failed
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
