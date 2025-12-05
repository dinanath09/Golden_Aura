// backend/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const UPLOAD_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  // accept images only
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
