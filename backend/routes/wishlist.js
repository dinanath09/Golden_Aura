// backend/routes/wishlist.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const WL = require("../controllers/wishlistController");

// GET /api/wishlist              -> get full wishlist (populated)
router.get("/", protect, WL.getWishlist);

// GET /api/wishlist/check/:productId -> check single product wished (returns { wished: true/false })
router.get("/check/:productId", protect, WL.check);

// POST /api/wishlist             -> add to wishlist { productId }
router.post("/", protect, WL.add);

// DELETE /api/wishlist/:productId -> remove by param
router.delete("/:productId", protect, WL.remove);

// also allow DELETE /api/wishlist { productId } fallback
router.delete("/", protect, WL.remove);

module.exports = router;
