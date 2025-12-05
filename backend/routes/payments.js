// backend/routes/payments.js
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

// ---- optional auth protect (won't crash if shape different) ----
let protect = (req, _res, next) => next();
try {
  const auth = require("../middleware/auth");
  protect = auth?.protect || auth?.default?.protect || protect;
} catch {
  console.warn("⚠️ auth middleware not found, /payments routes are public");
}

// ---- models (for saving order; assumes these files exist) ----
let Order, Product;
try {
  Order = require("../models/Order");
  Product = require("../models/Product");
} catch {
  console.warn("⚠️ Order/Product models not found. Orders won't be saved.");
}

// ---- mailer (optional). If file missing, email is skipped safely ----
let sendMail = async () => {};
try {
  ({ sendMail } = require("../utils/mailer"));
} catch {
  console.warn("⚠️ utils/mailer not found. Invoice emails disabled.");
}

/* ---------------- Razorpay client ------------------ */
const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* -------------- Debug: test & debug keys ----------- */

// GET  http://localhost:5000/api/payments/test
router.get("/test", (_req, res) => {
  res.json({ ok: true, message: "payments router working" });
});

// GET  http://localhost:5000/api/payments/debug
router.get("/debug", (_req, res) => {
  res.json({
    key_id: process.env.RAZORPAY_KEY_ID || null,
    has_secret: Boolean(process.env.RAZORPAY_KEY_SECRET),
  });
});

/* -------------- Create Razorpay order -------------- */
// POST http://localhost:5000/api/payments/create-order
// body: { amount, items: [{ productId, title, price, qty }, ...] }
router.post("/create-order", protect, async (req, res) => {
  try {
    const { amount, items } = req.body || {};
    console.log("🔹 /create-order body:", req.body);

    if (!amount || !items || !Array.isArray(items) || !items.length) {
      return res
        .status(400)
        .json({ ok: false, message: "Amount and items are required" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res
        .status(500)
        .json({ ok: false, message: "Razorpay keys not configured" });
    }

    const amountPaise = Math.round(Number(amount) * 100);

    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: "ga_" + Date.now(),
    });

    console.log("✅ Razorpay order created:", order.id);

    return res.json({
      ok: true,
      order, // { id, amount, currency, ... }
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("❌ create-order error:", err && (err.stack || err));
    return res
      .status(500)
      .json({ ok: false, message: "Could not create payment order" });
  }
});

/* -------------- Verify payment + save order -------- */
// POST http://localhost:5000/api/payments/verify
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, delivery }
router.post("/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      delivery,
    } = req.body || {};

    console.log("🔹 /verify body:", req.body);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ ok: false, message: "Missing payment verification fields" });
    }

    const signPayload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signPayload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ verify error: signature mismatch");
      return res
        .status(400)
        .json({ ok: false, message: "Invalid payment signature" });
    }

    // calculate total from items
    const totalAmount = Number(
      (items || []).reduce(
        (sum, it) =>
          sum +
          (Number(it.price) || 0) * (Number(it.qty || it.quantity || 1) || 1),
        0
      )
    );

    let orderDoc = {
      items,
      delivery,
      amount: totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "paid",
    };

    // Save to DB if Order model exists
    if (Order) {
      orderDoc = await Order.create({
        user: req.user?._id || null,
        ...orderDoc,
      });
      console.log("✅ Order saved with id:", orderDoc._id);
    } else {
      console.warn("ℹ️ Order model missing, returning in-memory order.");
    }

    // Send invoice email (best-effort, won't crash on failure)
    try {
      const toEmail = delivery?.email || req.user?.email;
      if (toEmail && Product && sendMail) {
        const invoiceHtml = await buildInvoiceHtml(orderDoc);
        await sendMail({
          to: toEmail,
          subject: `Invoice for Order ${orderDoc._id || orderDoc.razorpayOrderId}`,
          html: invoiceHtml,
        });
        console.log("📧 Invoice email sent to:", toEmail);
      }
    } catch (mailErr) {
      console.error("⚠️ Failed to send invoice email:", mailErr);
    }

    return res.json({ ok: true, order: orderDoc });
  } catch (err) {
    console.error("❌ verify error:", err && (err.stack || err));
    return res
      .status(500)
      .json({ ok: false, message: "Verification failed" });
  }
});

// helper to build simple invoice HTML
async function buildInvoiceHtml(orderDoc) {
  const order = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
  const items = order.items || [];
  const d = order.delivery || {};

  const rows = items
    .map((it, i) => {
      const qty = it.qty || it.quantity || 1;
      const price = Number(it.price || 0);
      const lineTotal = qty * price;
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${it.title || "-"}</td>
          <td>${qty}</td>
          <td>₹${price.toFixed(2)}</td>
          <td>₹${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  const createdAt = new Date(order.createdAt || Date.now()).toLocaleString(
    "en-IN"
  );

  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <h2>Golden Aura - Invoice</h2>
      <p><strong>Order ID:</strong> ${order._id || order.razorpayOrderId}</p>
      <p><strong>Date:</strong> ${createdAt}</p>

      <h3>Customer Details</h3>
      <p>
        ${d.name || ""}<br/>
        ${d.email || ""}<br/>
        ${d.phone || ""}<br/>
        ${d.address || ""}<br/>
        ${d.pincode || ""}
      </p>

      <h3>Items</h3>
      <table width="100%" border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse;">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <h3 style="text-align:right;">Grand Total: ₹${Number(
        order.amount || 0
      ).toFixed(2)}</h3>

      <p>Thank you for shopping with Golden Aura!</p>
    </div>
  `;
}

module.exports = router;
