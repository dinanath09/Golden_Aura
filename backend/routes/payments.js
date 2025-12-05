// backend/routes/payments.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { protect } = require("../middleware/auth"); // keep if you want auth
const Order = require("../models/Order"); // ensure your Order model exists

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
// NOTE: If you want to allow guest checkout for testing, remove `protect` here.
// For production, keep protect so only logged in users can create orders.
router.post("/create-order", protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) return res.status(400).json({ ok: false, message: "Invalid amount" });

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const razorpayOrder = await rzp.orders.create(options);

    return res.json({
      ok: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    console.error("create-order error:", err);
    return res.status(500).json({ ok: false, message: "Failed to create order" });
  }
});

// Verify payment and save order
router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, delivery } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, message: "Missing payment fields" });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ ok: false, message: "Invalid signature" });
    }

    let totalAmount = 0;
    if (Array.isArray(items)) {
      totalAmount = items.reduce((s, it) => s + (Number(it.price || 0) * (Number(it.qty) || 1)), 0);
    }

    const orderDoc = await Order.create({
      user: req.user?._id || null,
      items: items || [],
      delivery: delivery || {},
      amount: totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "paid",
      createdAt: new Date(),
    });

    return res.json({ ok: true, order: orderDoc });
  } catch (err) {
    console.error("verify error:", err);
    return res.status(500).json({ ok: false, message: "Verification failed" });
  }
});

module.exports = router;
