// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

/* ---------------------- Config ---------------------- */
const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/golden_aura_site";

app.set("trust proxy", true);

/* ---------------------- Ensure uploads dir ---------------------- */
const UPLOAD_DIR = path.join(__dirname, "uploads");
try {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (err) {
  console.warn("Could not ensure uploads directory:", err?.message || err);
}

/* ---------------------- Middleware ---------------------- */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

/* ---------------------- CORS ---------------------- */
const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
];
const EXTRA_ORIGIN = (process.env.FRONTEND_URL || "").trim();
const ALLOWED_ORIGINS = EXTRA_ORIGIN
  ? Array.from(new Set([...DEFAULT_ORIGINS, EXTRA_ORIGIN]))
  : DEFAULT_ORIGINS;

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

/* ---------------------- Static ---------------------- */
app.use("/uploads", express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, "public")));

/* ---------------------- Safe require helper ---------------------- */
function tryRequire(relPath) {
  try {
    return require(relPath);
  } catch (err) {
    if (err && err.code === "MODULE_NOT_FOUND") {
      console.log(`ℹ️  Optional module not found: ${relPath} — skipping.`);
      return null;
    }
    console.error(`⚠️ Error requiring ${relPath}:`, err && err.stack ? err.stack : err);
    return null;
  }
}

function isValidRouter(obj) {
  return obj && (typeof obj === "function" || typeof obj.use === "function");
}

/* ---------------------- Load routers ---------------------- */
const authRoutes = tryRequire("./routes/auth");
const productRoutes = tryRequire("./routes/products");
const orderRoutes = tryRequire("./routes/orders");
const storeRoutes = tryRequire("./routes/store");
const adminRoutes = tryRequire("./routes/admin");
const userRoutes = tryRequire("./routes/users");
const wishlistRoutes = tryRequire("./routes/wishlist");
const cartRoutes = tryRequire("./routes/cart");
const paymentRoutes = tryRequire("./routes/payments");

[
  ["authRoutes", authRoutes],
  ["productRoutes", productRoutes],
  ["orderRoutes", orderRoutes],
  ["storeRoutes", storeRoutes],
  ["adminRoutes", adminRoutes],
  ["userRoutes", userRoutes],
  ["wishlistRoutes", wishlistRoutes],
  ["cartRoutes", cartRoutes],
  ["paymentRoutes", paymentRoutes],
].forEach(([name, router]) => {
  if (!router) console.log(`ℹ️ ${name} not present — skipping`);
  else if (!isValidRouter(router)) console.warn(`❗ ${name} present but not a router — skipping`);
  else console.log(`✅ ${name} loaded`);
});

/* ---------------------- Healthcheck ---------------------- */
app.get("/", (_req, res) =>
  res.json({
    ok: true,
    name: "Golden Aura API",
    env: process.env.NODE_ENV || "development",
  })
);

/* ---------------------- Mount routers ---------------------- */
if (authRoutes && isValidRouter(authRoutes)) app.use("/api/auth", authRoutes);
if (productRoutes && isValidRouter(productRoutes)) app.use("/api/products", productRoutes);
if (orderRoutes && isValidRouter(orderRoutes)) app.use("/api/orders", orderRoutes);
if (storeRoutes && isValidRouter(storeRoutes)) app.use("/api/store", storeRoutes);
if (adminRoutes && isValidRouter(adminRoutes)) app.use("/api/admin", adminRoutes);
if (userRoutes && isValidRouter(userRoutes)) app.use("/api/users", userRoutes);
if (wishlistRoutes && isValidRouter(wishlistRoutes)) app.use("/api/wishlist", wishlistRoutes);
if (cartRoutes && isValidRouter(cartRoutes)) app.use("/api/cart", cartRoutes);
if (paymentRoutes && isValidRouter(paymentRoutes)) app.use("/api/payments", paymentRoutes);

/* ---------------------- 404 + error handler ---------------------- */
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

/* ---------------------- Start listening ---------------------- */
(async () => {
  try {
    await connectDB(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err?.message || err);
  }

  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log("🌍 Allowed origins:", ALLOWED_ORIGINS);
  });

  process.on("unhandledRejection", (reason) => console.error("UNHANDLED REJECTION:", reason));
  process.on("uncaughtException", (err) => console.error("UNCAUGHT EXCEPTION:", err));
})();
