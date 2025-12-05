// backend/routes/products.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { protect, isAdmin } = require("../middleware/auth");
const {
  createProduct,
  uploadProductImages,
  getProduct,
  listProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// ensure uploads dir exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname || "")}`);
  },
});

const upload = multer({ storage });

// public
router.get("/", listProducts);
router.get("/:id", getProduct);

// admin-only
router.post("/", protect, isAdmin, createProduct);
router.post(
  "/:id/images",
  protect,
  isAdmin,
  upload.array("images", 6),
  uploadProductImages
);
router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

module.exports = router;
