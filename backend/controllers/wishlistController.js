// backend/controllers/wishlistController.js
const User = require("../models/User");
const Product = require("../models/Product"); // optional, if you want product details

// GET list (populated)
exports.getWishlist = async (req, res, next) => {
  try {
    const u = await User.findById(req.user._id).select("wishlist").populate({
      path: "wishlist",
      select: "_id title price images category type", // pick fields you need
    }).lean();
    // return array of product objects (populated) or ids
    const list = (u && Array.isArray(u.wishlist)) ? u.wishlist : [];
    return res.json({ wishlist: list });
  } catch (err) { next(err); }
};

// check single product
exports.check = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ message: "productId required" });
    const u = await User.findById(req.user._id).select("wishlist").lean();
    const wished = Array.isArray(u?.wishlist) && u.wishlist.some((id) => String(id) === String(productId));
    return res.json({ wished: !!wished });
  } catch (err) { next(err); }
};

// add to wishlist
exports.add = async (req, res, next) => {
  try {
    const { productId } = (req.body || {});
    if (!productId) return res.status(400).json({ message: "productId required" });
    const u = await User.findById(req.user._id);
    if (!u) return res.status(404).json({ message: "User not found" });
    u.wishlist = u.wishlist || [];
    if (!u.wishlist.some((id) => String(id) === String(productId))) {
      u.wishlist.push(productId);
      await u.save();
    }
    // return updated wishlist (optionally populated)
    const fresh = await User.findById(req.user._id).select("wishlist").populate("wishlist", "_id title price images").lean();
    return res.status(201).json({ wishlist: fresh.wishlist });
  } catch (err) { next(err); }
};

// remove from wishlist: support param or body
exports.remove = async (req, res, next) => {
  try {
    const productId = req.params.productId || (req.body || {}).productId;
    if (!productId) return res.status(400).json({ message: "productId required" });
    const u = await User.findById(req.user._id);
    if (!u) return res.status(404).json({ message: "User not found" });
    u.wishlist = (u.wishlist || []).filter((id) => String(id) !== String(productId));
    await u.save();
    const fresh = await User.findById(req.user._id).select("wishlist").populate("wishlist", "_id title price images").lean();
    return res.json({ wishlist: fresh.wishlist });
  } catch (err) { next(err); }
};
