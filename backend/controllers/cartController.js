// backend/controllers/cartController.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.getCart = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const c = await Cart.findOne({ user: req.user._id }).populate("items.product").lean();
    res.json(c || { user: req.user._id, items: [] });
  } catch (err) { next(err); }
};

// Accepts either items array (server cart persistence) OR { productId, qty } to add single item
exports.saveCart = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // If client sent items array
    if (Array.isArray(req.body.items)) {
      const c = await Cart.findOneAndUpdate(
        { user: req.user._id },
        { user: req.user._id, items: req.body.items },
        { new: true, upsert: true }
      ).populate("items.product").lean();
      return res.json(c);
    }

    // else accept productId + qty -> merge into server cart
    const { productId, qty = 1 } = req.body || {};
    if (!productId) return res.status(400).json({ message: "productId required" });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      const newCart = await Cart.create({ user: req.user._id, items: [{ product: productId, qty }] });
      await newCart.populate("items.product");
      return res.json(newCart);
    }

    // merge
    const item = cart.items.find(it => String(it.product) === String(productId));
    if (item) item.qty = (item.qty || 0) + Number(qty);
    else cart.items.push({ product: productId, qty: Number(qty) });

    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  } catch (err) { next(err); }
};
