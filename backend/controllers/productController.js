// controllers/productController.js
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Product = require("../models/Product");

/**
 * Normalize the images field so API always returns array of { url }
 */
function normalizeImagesField(imgs) {
  if (!imgs) return [];
  if (!Array.isArray(imgs)) imgs = [imgs];
  return imgs.map((it) => {
    if (!it) return { url: "/no-image.jpg" };
    if (typeof it === "string") return { url: it };
    if (typeof it === "object") {
      const url =
        it.url ||
        it.path ||
        it.secure_url ||
        it.public_url ||
        it.src ||
        (typeof it === "object" && it.image) ||
        null;
      return { url: url || "/no-image.jpg" };
    }
    return { url: "/no-image.jpg" };
  });
}

/**
 * Validate id param helper
 * Treat explicit string "undefined" or "null" as missing (common frontend bug)
 */
function validateObjectId(id) {
  if (!id || id === "undefined" || id === "null" || String(id).trim() === "") {
    return { ok: false, status: 400, message: "Product id is required" };
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { ok: false, status: 400, message: "Invalid product id" };
  }
  return { ok: true };
}

/**
 * Ensure uploads directory exists (used by upload endpoint)
 */
function ensureUploadsDir() {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  try {
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn("Could not ensure uploads dir:", err && err.message);
  }
}

/**
 * Create a new product (admin only)
 */
async function createProduct(req, res, next) {
  try {
    const { title, price, type, category, description } = req.body;
    if (!title || price === undefined) {
      return res
        .status(400)
        .json({ ok: false, message: "Title and price are required" });
    }
    const product = await Product.create({
      title: String(title).trim(),
      price: Number(price),
      type: type || "Spray",
      category: category || "Unisex",
      description: description || "",
      images: [],
    });
    return res.status(201).json({ ok: true, product });
  } catch (err) {
    console.error("createProduct error:", err && (err.stack || err));
    return next(err);
  }
}

/**
 * Upload images for a product
 */
async function uploadProductImages(req, res, next) {
  try {
    const id = req.params.id;

    // quick debug logging for common frontend bugs
    if (!id || id === "undefined") {
      console.warn("uploadProductImages called with invalid id:", id);
    }

    // validate id
    const valid = validateObjectId(id);
    if (!valid.ok) return res.status(valid.status).json({ ok: false, message: valid.message });

    // ensure uploads folder exists
    ensureUploadsDir();

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ ok: false, message: "Product not found" });

    const files = req.files || [];
    if (!files.length) return res.status(400).json({ ok: false, message: "No files uploaded" });

    if (!Array.isArray(product.images)) product.images = [];

    const uploaded = [];
    files.forEach((f) => {
      // support multiple multer shapes
      const filename =
        f.filename ||
        (f.path && path.basename(f.path)) ||
        f.originalname ||
        `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}.dat`;
      const url = `/uploads/${filename}`;
      product.images.push({ url });
      uploaded.push(url);
    });

    await product.save();

    // return normalized images
    const ret = product.toObject ? product.toObject() : product;
    ret.images = normalizeImagesField(ret.images);

    return res.json({ ok: true, uploaded, product: ret });
  } catch (err) {
    console.error("uploadProductImages error:", err && (err.stack || err));
    return next(err);
  }
}

/**
 * Get single product by id
 */
async function getProduct(req, res, next) {
  try {
    const id = req.params.id;

    // quick debug logging
    if (!id || id === "undefined") {
      console.warn("getProduct called with invalid id:", id);
    }

    // validate id
    const valid = validateObjectId(id);
    if (!valid.ok) return res.status(valid.status).json({ ok: false, message: valid.message });

    // safe find: we validated id already so this won't throw CastError
    const product = await Product.findById(id).lean();
    if (!product) return res.status(404).json({ ok: false, message: "Product not found" });

    product.images = normalizeImagesField(product.images);
    return res.json({ ok: true, product });
  } catch (err) {
    console.error("getProduct error:", err && (err.stack || err));
    return next(err);
  }
}

/**
 * List products
 */
async function listProducts(req, res, next) {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(200).lean();
    const normalized = products.map((p) => {
      p.images = normalizeImagesField(p.images);
      return p;
    });
    return res.json({ ok: true, products: normalized });
  } catch (err) {
    console.error("listProducts error:", err && (err.stack || err));
    return next(err);
  }
}

module.exports = { createProduct, uploadProductImages, getProduct, listProducts };
