// backend/controllers/wishlistController.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");

// helper: normalize id to string
const toId = (v) => String(v);

/**
 * GET /api/wishlist
 * Return all products in the logged-in user's wishlist
 * Now uses user.wishlist array instead of separate Wishlist collection
 */
async function getWishlist(req, res, next) {
  try {
    const userId = req.user._id;

    // load user with wishlist populated
    const user = await User.findById(userId)
      .populate("wishlist")
      .lean();

    if (!user) {
      return res.status(401).json({ ok: false, message: "User not found" });
    }

    // user.wishlist is an array of Product docs (because of populate)
    const products = Array.isArray(user.wishlist) ? user.wishlist : [];

    return res.json({ ok: true, products });
  } catch (err) {
    console.error("getWishlist error:", err && (err.stack || err));
    next(err);
  }
}

/**
 * POST /api/wishlist  { productId }
 * Add a product to user.wishlist
 */
async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res
        .status(400)
        .json({ ok: false, message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ ok: false, message: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ ok: false, message: "User not found" });
    }

    const already = (user.wishlist || []).some(
      (id) => toId(id) === toId(productId)
    );
    if (already) {
      return res.json({
        ok: true,
        message: "Already in wishlist",
        product,
      });
    }

    user.wishlist = user.wishlist || [];
    user.wishlist.push(new mongoose.Types.ObjectId(productId));
    await user.save();

    return res.status(201).json({
      ok: true,
      message: "Added to wishlist",
      product,
    });
  } catch (err) {
    console.error("addToWishlist error:", err && (err.stack || err));
    next(err);
  }
}

/**
 * DELETE /api/wishlist/:productId
 * Remove a product from user.wishlist
 */
async function removeFromWishlist(req, res, next) {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ ok: false, message: "User not found" });
    }

    user.wishlist = (user.wishlist || []).filter(
      (id) => toId(id) !== toId(productId)
    );

    await user.save();

    return res.json({
      ok: true,
      message: "Removed from wishlist",
    });
  } catch (err) {
    console.error("removeFromWishlist error:", err && (err.stack || err));
    next(err);
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
