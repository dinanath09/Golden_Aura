require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

/* ---------------------- Config ---------------------- */
const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/golden_aura_site";

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

/* ---------------------- Middleware ----------------------- */
app.use(express.json({ limit: "2mb" }));

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser requests (like curl/postman) with no origin
      if (!origin) return cb(null, true);
      return ALLOWED_ORIGINS.includes(origin)
        ? cb(null, true)
        : cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

/* ---------------------- Static assets -------------------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

/* ---------------------- Import Routes -------------------- */
let authRoutes, productRoutes, orderRoutes, storeRoutes, adminRoutes, userRoutes, wishlistRoutes, cartRoutes, paymentRoutes;

try {
  authRoutes = require("./routes/auth");
  productRoutes = require("./routes/products");
  orderRoutes = require("./routes/orders");
  storeRoutes = require("./routes/store");
  adminRoutes = require("./routes/admin");
  userRoutes = require("./routes/users");
  wishlistRoutes = require("./routes/wishlist");
  cartRoutes = require("./routes/cart");
} catch (err) {
  console.error("Failed to require one of the core routes. Check the stack trace below:");
  console.error(err && (err.stack || err));
  process.exit(1);
}

// payments route is optional
try {
  paymentRoutes = require("./routes/payments");
  console.log("✅ payments route loaded.");
} catch (err) {
  console.warn("⚠️ Payment routes NOT loaded. Continuing without payments.");
  paymentRoutes = null;
}

/* ---------------------- Validate Routers ----------------- */
function assertRouter(label, router) {
  const ok = router && (typeof router === "function" || typeof router.use === "function");
  if (!ok) {
    const received = router === null || router === undefined ? String(router) : typeof router;
    throw new Error(`❌ ${label} is NOT a valid Express Router. Received: ${received}`);
  }
}

try {
  assertRouter("authRoutes", authRoutes);
  assertRouter("productRoutes", productRoutes);
  assertRouter("orderRoutes", orderRoutes);
  assertRouter("storeRoutes", storeRoutes);
  assertRouter("adminRoutes", adminRoutes);
  assertRouter("userRoutes", userRoutes);
  assertRouter("wishlistRoutes", wishlistRoutes);
  assertRouter("cartRoutes", cartRoutes);
  if (paymentRoutes) assertRouter("paymentRoutes", paymentRoutes);
} catch (err) {
  console.error("Router validation failed:", err.message || err);
  process.exit(1);
}

/* ---------------------- Connect DB ----------------------- */
connectDB(MONGO_URI);

/* ---------------------- Healthcheck ---------------------- */
app.get("/", (_req, res) =>
  res.json({
    ok: true,
    name: "Golden Aura API",
    env: process.env.NODE_ENV || "development",
  })
);

/* ---------------------- Debug endpoints ------------------ */
// Quick DB check for dev
app.get("/api/debug/products-count", async (req, res) => {
  try {
    const Product = require("./models/Product");
    const count = await Product.countDocuments({});
    res.json({ ok: true, count });
  } catch (err) {
    console.error("Debug products-count error:", err && (err.stack || err));
    res.status(500).json({ ok: false, message: "DB error", error: err.message });
  }
});

/* ---------------------- Mount Routes --------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);

if (paymentRoutes) {
  app.use("/api/payments", paymentRoutes);
} else {
  console.log("🔸 Note: /api/payments is not mounted (payments route missing).");
}

/* ---------------------- 404 Handler ----------------------- */
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

/* ---------------------- Start Server ---------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log("🌍 Allowed origins:", ALLOWED_ORIGINS);
});

/* ---------------------- Crash Protection ------------------ */
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason && (reason.stack || reason));
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err && (err.stack || err));
});
