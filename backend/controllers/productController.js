// backend/controllers/productController.js
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Product = require("../models/Product");

function normalizeImagesField(imgs) {
  if (!imgs) return [];
  if (!Array.isArray(imgs)) imgs = [imgs];

  return imgs.map((it) => {
    if (!it) return { url: "/no-image.jpg" };
    if (typeof it === "string") return { url: it };

    if (typeof it === "object" && it !== null) {
      return {
        url:
          it.url ||
          it.secure_url ||
          it.path ||
          it.location ||
          "/no-image.jpg",
        public_id: it.public_id || it.id || undefined,
      };
    }

    return { url: "/no-image.jpg" };
  });
}

function buildProductPayload(body = {}) {
  const payload = {
    title: String(body.title || "").trim(),
    type: body.type || "Spray",
    description: body.description || "",
    category: body.category || "Unisex",
    price: Number(body.price) || 0,
    stock: body.stock !== undefined ? Number(body.stock) || 0 : 0,
  };

  if (body.brand && typeof body.brand === "object") {
    payload.brand = {
      name: String(body.brand.name || "").trim(),
      country: body.brand.country || "India",
      description: body.brand.description || "",
    };
  } else {
    const name = String(body.brandName || body.brand_name || "").trim();
    if (name) {
      payload.brand = {
        name,
        country: body.brandCountry || body.brand_country || "India",
        description:
          body.brandDescription || body.brand_description || "",
      };
    }
  }

  return payload;
}

async function createProduct(req, res, next) {
  try {
    const payload = buildProductPayload(req.body);

    if (!payload.title) {
      return res
        .status(400)
        .json({ ok: false, message: "Product title is required" });
    }
    if (!payload.price || payload.price < 0) {
      return res
        .status(400)
        .json({ ok: false, message: "Valid price is required" });
    }

    const product = await Product.create(payload);
    const plain = product.toObject();
    plain.images = normalizeImagesField(plain.images);

    return res.status(201).json({ ok: true, product: plain });
  } catch (err) {
    console.error("createProduct error:", err && (err.stack || err));
    return next(err);
  }
}

async function uploadProductImages(req, res, next) {
  try {
    const productId = req.params.id;
    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid product id" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ ok: false, message: "Product not found" });
    }

    const files = req.files || [];
    if (!files.length) {
      return res
        .status(400)
        .json({ ok: false, message: "No files uploaded" });
    }

    if (!Array.isArray(product.images)) {
      product.images = [];
    }

    const uploadedUrls = [];
    files.forEach((f) => {
      const filename =
        f.filename ||
        (f.path && path.basename(f.path)) ||
        f.originalname ||
        `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}.dat`;

      const url = `/uploads/${filename}`;
      product.images.push({ url });
      uploadedUrls.push(url);
    });

    await product.save();
    const plain = product.toObject();
    plain.images = normalizeImagesField(plain.images);

    return res.json({ ok: true, product: plain, uploaded: uploadedUrls });
  } catch (err) {
    console.error("uploadProductImages error:", err && (err.stack || err));
    return next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid product id" });
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ ok: false, message: "Product not found" });
    }

    product.images = normalizeImagesField(product.images);
    return res.json({ ok: true, product });
  } catch (err) {
    console.error("getProduct error:", err && (err.stack || err));
    return next(err);
  }
}

async function listProducts(req, res, next) {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

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

async function updateProduct(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid product id" });
    }

    const payload = buildProductPayload(req.body);

    const updated = await Product.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ ok: false, message: "Product not found" });
    }

    updated.images = normalizeImagesField(updated.images);
    return res.json({ ok: true, product: updated });
  } catch (err) {
    console.error("updateProduct error:", err && (err.stack || err));
    return next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid product id" });
    }

    const deleted = await Product.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res.status(404).json({ ok: false, message: "Product not found" });
    }

    return res.json({ ok: true, message: "Product deleted" });
  } catch (err) {
    console.error("deleteProduct error:", err && (err.stack || err));
    return next(err);
  }
}

module.exports = {
  createProduct,
  uploadProductImages,
  getProduct,
  listProducts,
  updateProduct,
  deleteProduct,
};
