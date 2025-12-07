// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

/* ---------------------- Config ---------------------- */
const PORT = Number(process.env.PORT || 5000);
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/golden_aura_site";

// Local + default production origins
const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "https://golden-aura-ip1e.vercel.app",
];

// FRONTEND_URL can be single or comma-separated list
const EXTRA_ORIGINS_RAW = process.env.FRONTEND_URL || "";
const EXTRA_ORIGINS = EXTRA_ORIGINS_RAW
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = Array.from(
  new Set([...DEFAULT_ORIGINS, ...EXTRA_ORIGINS])
);

/* ---------------------- Middleware ----------------------- */
app.use(express.json({ limit: "5mb" }));

// CORS – allows localhost + all golden-aura-ip1e*.vercel.app URLs
app.use(
  cors({
    origin: (origin, cb) => {
      // allow tools like curl / Postman with no origin
      if (!origin) return cb(null, true);

      // exact allow-list
      if (ALLOWED_ORIGINS.includes(origin)) {
        return cb(null, true);
      }

      // allow any Vercel URL for this project:
      //  golden-aura-ip1e.vercel.app
      //  golden-aura-ip1e-dinanaths-projects.vercel.app
      //  golden-aura-ip1e-git-main-dinanaths-projects.vercel.app
      if (/^https:\/\/golden-aura-ip1e.*\.vercel\.app$/.test(origin)) {
        return cb(null, true);
      }

      console.warn(`CORS blocked for origin: ${origin}`);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

/* ---------------------- Static assets -------------------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

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
app.get("/api/debug/products-count", async (_req, res) => {
  try {
    const Product = require("./models/Product");
    const count = await Product.countDocuments({});
    res.json({ ok: true, count });
  } catch (err) {
    console.error("Debug products-count error:", err && (err.stack || err));
    res
      .status(500)
      .json({ ok: false, message: "DB error", error: err.message });
  }
});

/* ---------------------- Import Routes -------------------- */
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const storeRoutes = require("./routes/store");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/users");
const wishlistRoutes = require("./routes/wishlist");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/payments");

/* ---------------------- Mount Routes --------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);

/* ---------------------- 404 & Error Handler -------------- */
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

/* ---------------------- Start Server ---------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log("🌍 Allowed origins:", ALLOWED_ORIGINS);
});

/* ---------------------- Crash Protection ------------------ */
process.on("unhandledRejection", (reason) => {
  console.error(
    "UNHANDLED REJECTION:",
    reason && (reason.stack || reason.toString())
  );
});
process.on("uncaughtException", (err) => {
  console.error(
    "UNCAUGHT EXCEPTION:",
    err && (err.stack || err.toString())
  );
});
