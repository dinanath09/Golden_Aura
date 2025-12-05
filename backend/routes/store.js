// backend/routes/store.js
const express = require("express");
const router = express.Router();

// Optional: protect / requireAdmin middleware if you have them
// const { protect, requireAdmin } = require("../middleware/auth");

// Example in-memory store settings; ideally this should be in DB
let STORE_SETTINGS = {
  name: "Golden Aura",
  currency: "INR",
  shipping: { freeThreshold: 999, flatRate: 40 },
  updatedAt: new Date(),
};

/**
 * GET /api/store
 * Public: return store settings
 */
router.get("/", async (req, res) => {
  try {
    return res.json({ ok: true, settings: STORE_SETTINGS });
  } catch (err) {
    console.error("GET /api/store error:", err);
    return res.status(500).json({ ok: false, message: "Failed to load store settings" });
  }
});

/**
 * PUT /api/store
 * Admin-only (recommended). Update store settings.
 */
router.put("/", /* protect, requireAdmin, */ async (req, res) => {
  try {
    const payload = req.body || {};
    // Only merge known fields to avoid accidental injection
    if (payload.name) STORE_SETTINGS.name = String(payload.name).trim();
    if (payload.currency) STORE_SETTINGS.currency = String(payload.currency).trim();
    if (payload.shipping && typeof payload.shipping === "object") {
      STORE_SETTINGS.shipping = {
        ...STORE_SETTINGS.shipping,
        ...payload.shipping,
      };
    }
    STORE_SETTINGS.updatedAt = new Date();
    return res.json({ ok: true, settings: STORE_SETTINGS });
  } catch (err) {
    console.error("PUT /api/store error:", err);
    return res.status(500).json({ ok: false, message: "Failed to update store settings" });
  }
});

module.exports = router;
