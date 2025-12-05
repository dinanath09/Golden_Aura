// backend/routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Cart = require("../models/Cart"); // create this model (below)

// GET /api/cart  (returns user's cart)
router.get("/", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  res.json(cart || { user: req.user._id, items: [] });
});

// POST /api/cart  (add or increment)
router.post("/", protect, async (req, res) => {
  const { productId, qty = 1 } = req.body;
  if (!productId) return res.status(400).json({ ok: false, message: "productId required" });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find(i => String(i.product) === String(productId));
  if (existing) existing.qty = Number(existing.qty || 0) + Number(qty || 1);
  else cart.items.push({ product: productId, qty: Number(qty || 1) });

  await cart.save();
  res.json(await Cart.findById(cart._id).populate("items.product"));
});

// PUT /api/cart  (set qty) - expects { productId, qty }
router.put("/", protect, async (req, res) => {
  const { productId, qty } = req.body;
  if (!productId) return res.status(400).json({ ok: false, message: "productId required" });
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.json({ user: req.user._id, items: [] });

  cart.items = cart.items.map(i => {
    if (String(i.product) === String(productId)) return { product: i.product, qty: Number(qty || 0) };
    return i;
  }).filter(i => Number(i.qty) > 0);

  await cart.save();
  res.json(await Cart.findById(cart._id).populate("items.product"));
});

// DELETE /api/cart (body: { productId }) OR DELETE /api/cart/:productId
router.delete("/", protect, async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ ok: false, message: "productId required" });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.json({ user: req.user._id, items: [] });

  cart.items = cart.items.filter(i => String(i.product) !== String(productId));
  await cart.save();
  res.json(await Cart.findById(cart._id).populate("items.product"));
});

router.delete("/clear", protect, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.json({ user: req.user._id, items: [] });

  cart.items = [];
  await cart.save();
  res.json({ ok: true });
});

module.exports = router;
