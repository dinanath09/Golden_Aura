// backend/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

function signToken(user) {
  // include _id so protect() can find user
  return jwt.sign({ _id: String(user._id) }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

async function register(req, res, next) {
  try {
    const { name, email, password, mobile } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email: (email || "").toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      mobile: mobile || "",
    });

    const token = signToken(user);
    res.json({ ok: true, token, user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Provide email and password" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);

    // Return token plus safe user object (User schema strips password via toJSON)
    res.json({ ok: true, token, user });
  } catch (err) {
    next(err);
  }
}

// debug endpoint: returns current user
async function me(req, res, next) {
  try {
    res.json({ ok: true, user: req.user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
