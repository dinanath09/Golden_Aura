// backend/routes/users.js
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const UC = require("../controllers/userController");

// -----------------------------
// Me (profile)
// -----------------------------
router.get("/me", protect, UC.getMe);       // Get current user (safe fields)
router.put("/me", protect, UC.updateMe);    // Update basic profile (name, etc.)

// -----------------------------
// Security
// -----------------------------
router.post("/me/change-password", protect, UC.changePassword);

// -----------------------------
// Addresses
// -----------------------------
router.get("/me/addresses", protect, UC.listAddresses);
router.post("/me/addresses", protect, UC.addAddress);
router.put("/me/addresses/:addrId", protect, UC.updateAddress);
router.delete("/me/addresses/:addrId", protect, UC.deleteAddress);

// -----------------------------
// Cart (persist cart server-side)
// -----------------------------
router.get("/me/cart", protect, UC.getCart);
router.post("/me/cart", protect, UC.saveCart);

// -----------------------------
// Password reset (public)
// -----------------------------
router.post("/forgot-password", UC.forgotPassword);
router.post("/reset-password/:token", UC.resetPassword);

module.exports = router;

// e.g. backend/routes/users.js
// const router = require("express").Router();
