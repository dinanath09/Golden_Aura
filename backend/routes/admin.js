// backend/routes/admin.js
const express = require("express");
const router = express.Router();

const { protect, isAdmin } = require("../middleware/auth"); // or { protect, adminOnly }
const { getStats } = require("../controllers/adminController");

router.get("/stats", protect, isAdmin, getStats);

module.exports = router;
