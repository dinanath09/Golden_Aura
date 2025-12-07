const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

// all wishlist endpoints require login
router.use(protect);

// GET /api/wishlist
router.get("/", getWishlist);

// POST /api/wishlist  { productId }
router.post("/", addToWishlist);

// DELETE /api/wishlist/:productId
router.delete("/:productId", removeFromWishlist);

module.exports = router;
