// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware: attach req.user after verifying JWT
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }

    const user = await User.findById(payload._id).select("_id name email role isBlocked");
    if (!user) return res.status(401).json({ message: "Unauthorized: User not found" });
    if (user.isBlocked) return res.status(403).json({ message: "Forbidden: Account is blocked" });

    req.user = user;
    next();
  } catch (err) {
    console.error("protect() error:", err);
    res.status(500).json({ message: "Server error in auth middleware" });
  }
}

/**
 * Middleware: admin-only guard
 */
function isAdmin(req, res, next) {
  try {
    if (req.user && req.user.role === "admin") return next();
    return res.status(403).json({ message: "Access denied: Admins only" });
  } catch (err) {
    console.error("isAdmin() error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// export both names to be compatible with routes that import `isAdmin` or `adminOnly`
module.exports = { protect, isAdmin, adminOnly: isAdmin };
