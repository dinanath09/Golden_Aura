// backend/routes/wishlist.js
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const WL = require("../controllers/wishlistController");

// check if product is in wishlist
router.get("/check/:id", protect, WL.check);

// get full wishlist (populated)
router.get("/", protect, WL.getWishlist);

// add to wishlist (body: { productId })
router.post("/", protect, WL.addToWishlist);

// remove from wishlist (param or body)
router.delete("/:productId", protect, WL.removeFromWishlist);

module.exports = router;
