import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";

const router = express.Router();

// ⭐ Existing product routes…
// router.get("/", ...)


// ⭐ NEW: featured products route
router.get(
  "/featured",
  asyncHandler(async (req, res) => {
    const products = await Product.find({ isFeatured: true }).limit(4);
    res.json(products);
  })
);

export default router;
