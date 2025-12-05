// backend/controllers/userController.js
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Cart = require("../models/Cart");

/* -------------------- Helper -------------------- */
function ensureAuth(req, res) {
  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  return true;
}

/* -------------------- User info -------------------- */
exports.getMe = async (req, res, next) => {
  try {
    if (!ensureAuth(req, res)) return;
    const me = await User.findById(req.user._id)
      .select("-password -resetToken -resetTokenExp")
      .lean();
    if (!me) return res.status(404).json({ message: "User not found" });
    res.json(me);
  } catch (e) {
    console.error("getMe error:", e && (e.stack || e));
    next(e);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    if (!ensureAuth(req, res)) return;

    // Build updates object to avoid writing undefined fields
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) updates.email = String(req.body.email).toLowerCase();
    if (req.body.mobile !== undefined) updates.mobile = req.body.mobile;
    if (req.body.avatarUrl !== undefined) updates.avatarUrl = req.body.avatarUrl;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    })
      .select("-password -resetToken -resetTokenExp")
      .lean();

    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (e) {
    console.error("updateMe error:", e && (e.stack || e));
    next(e);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    if (!ensureAuth(req, res)) return;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new passwords required" });
    }

    const u = await User.findById(req.user._id);
    if (!u) return res.status(404).json({ message: "User not found" });

    // comparePassword should be implemented on User schema (instance method)
    const ok = typeof u.comparePassword === "function" ? await u.comparePassword(oldPassword) : await bcrypt.compare(oldPassword, u.password);
    if (!ok) return res.status(400).json({ message: "Old password incorrect" });

    u.password = newPassword; // presave hook should hash it
    await u.save();
    res.json({ success: true });
  } catch (e) {
    console.error("changePassword error:", e && (e.stack || e));
    next(e);
  }
};

/* -------------------- Addresses -------------------- */
exports.listAddresses = async (req, res, next) => {
  try {
    if (!ensureAuth(req, res)) return;
    const u = await User.findById(req.user._id).select("addresses").lean();
    res.json(u?.addresses || []);
  } catch (e) {
    console.error("listAddresses error:", e && (e.stack || e));
    next(e);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    if (!ensureAuth(req, res)) return;
    const payload = req.body || {};

    const u = await User.findById(req.user._id);
    if (!u) return res.status(404).json({ message: "User not found" });

    // Ensure addresses array exists
    if (!Array.isArray(u.addresses)) u.addresses = [];

    if (payload.isDefault) {
      u.addresses.forEach((a) => (a.isDefault = false));
    }

    // Push payload as subdoc (Mongoose will cast)
    u.addresses.push(payload);
    await u.save();

    // Return updated addresses (lean)
    const fresh = await User.findById(req.user._id).select("addresses").lean();
    res.status(201).json(fresh.addresses || []);
  } catch (e) {
    console.error("addAddress error:", e && (e.stack || e));
    next(e);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    if (!ensureAuth(req, res)) return;
    const { addrId } = req.params;
    const body = req.body || {};

    if (!addrId) return res.status(400).json({ message: "Address id required" });

    const u = await User.findById(req.user._id);
    if (!u) return res.status(404).json({ message: "User not found" });

    if (!Array.isArray(u.addresses)) u.addresses = [];

    let found = false;
    // If new address should be default, clear other defaults
    if (body.isDefault) {
      u.addresses.forEach((x) => (x.isDefault = false));
    }

    u.addresses = u.addresses.map((a) => {
      if (String(a._id) === String(addrId)) {
        found = true;
        // Only update allowed fields
        const allowed = ["label", "name", "line1", "line2", "city", "state", "pincode", "country", "mobile", "isDefault"];
        allowed.forEach((k) => {
          if (body[k] !== undefined) a[k] = body[k];
        });
      }
      return a;
    });

    if (!found) return res.status(404).json({ message: "Address not found" });

    await u.save();
    const fresh = await User.findById(req.user._id).select("addresses").lean();
    res.json(fresh.addresses || []);
  } catch (e) {
    console.error("updateAddress error:", e && (e.stack || e));
    next(e);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    if (!ensureAuth(req, res)) return;
    const { addrId } = req.params;
    if (!addrId) return res.status(400).json({ message: "Address id required" });

    const u = await User.findById(req.user._id);
    if (!u) return res.status(404).json({ message: "User not found" });

    if (!Array.isArray(u.addresses)) u.addresses = [];

    const before = u.addresses.length;
    u.addresses = u.addresses.filter((a) => String(a._id) !== String(addrId));
    if (u.addresses.length === before) {
      return res.status(404).json({ message: "Address not found" });
    }

    await u.save();
    const fresh = await User.findById(req.user._id).select("addresses").lean();
    res.json(fresh.addresses || []);
  } catch (e) {
    console.error("deleteAddress error:", e && (e.stack || e));
    next(e);
  }
};

/* -------------------- Cart persistence (using Cart model) -------------------- */
exports.getCart = async (req, res, next) => {
  try {
    if (!ensureAuth(req, res)) return;
    // populate product in items, but handle missing cart
    const cDoc = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cDoc) return res.json({ user: req.user._id, items: [] });
    // convert to lean-like object
    const cart = cDoc.toObject ? cDoc.toObject() : cDoc;
    res.json(cart);
  } catch (e) {
    console.error("getCart error:", e && (e.stack || e));
    next(e);
  }
};

exports.saveCart = async (req, res, next) => {
  try {
    if (!ensureAuth(req, res)) return;
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: "Items must be an array" });

    // Validate each item shape minimally
    const sanitized = items.map((it) => {
      return {
        product: it.product,
        qty: Math.max(1, Number(it.qty) || 1),
        price: it.price !== undefined ? Number(it.price) : undefined,
      };
    });

    const c = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, items: sanitized },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("items.product");

    const cart = c.toObject ? c.toObject() : c;
    res.json(cart);
  } catch (e) {
    console.error("saveCart error:", e && (e.stack || e));
    next(e);
  }
};

/* -------------------- Forgot / Reset password -------------------- */
exports.forgotPassword = async (req, res, next) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    if (!email) return res.json({ success: true }); // don't reveal
    const u = await User.findOne({ email });
    if (!u) return res.json({ success: true }); // don't reveal

    const token = crypto.randomBytes(32).toString("hex");
    u.resetToken = crypto.createHash("sha256").update(token).digest("hex");
    u.resetTokenExp = Date.now() + 1000 * 60 * 30; // 30 min
    await u.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const { sendMail } = require("../utils/mailer");
    // sendMail should be implemented safely in utils/mailer
    await sendMail({
      to: u.email,
      subject: "Reset your Golden Aura password",
      html: `<p>Click to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    }).catch((mailErr) => {
      // don't fail the flow if mail fails; log and continue
      console.error("forgotPassword: mailer error:", mailErr && (mailErr.stack || mailErr));
    });

    res.json({ success: true });
  } catch (e) {
    console.error("forgotPassword error:", e && (e.stack || e));
    next(e);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const raw = req.params.token;
    if (!raw) return res.status(400).json({ message: "Token required" });

    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    const u = await User.findOne({ resetToken: hash, resetTokenExp: { $gt: Date.now() } });
    if (!u) return res.status(400).json({ message: "Invalid or expired link" });

    if (!req.body.password) return res.status(400).json({ message: "New password required" });

    u.password = req.body.password;
    u.resetToken = undefined;
    u.resetTokenExp = undefined;
    await u.save();

    res.json({ success: true });
  } catch (e) {
    console.error("resetPassword error:", e && (e.stack || e));
    next(e);
  }
};
