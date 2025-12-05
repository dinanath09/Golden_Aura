const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const auth = require("../middleware/auth");
const protect = auth?.protect || auth?.default?.protect;
const isAdmin = auth?.isAdmin || auth?.admin || auth?.adminOnly || auth?.default?.isAdmin;

const {
  createProduct,
  uploadProductImages,
  getProduct,
  listProducts,
} = require("../controllers/productController");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${name}${ext}`);
  },
});
const upload = multer({ storage });

// public
router.get("/", listProducts);
router.get("/:id", getProduct);

// admin only (if middleware available)
if (!protect || !isAdmin) {
  console.warn("⚠️ products route mounted without protect/isAdmin — admin-only endpoints disabled.");
} else {
  router.post("/", protect, isAdmin, createProduct);
  router.post("/:id/images", protect, isAdmin, upload.array("images", 6), uploadProductImages);
}

module.exports = router;
