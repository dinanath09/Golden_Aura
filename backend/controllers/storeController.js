// backend/controllers/storeController.js
// TEMP SAFE CONTROLLER — replace with your real logic later

// In memory fallback so the server boots
let state = {
  name: "Golden Aura",
  logo: "",
  theme: { primary: "#92400e", background: "#fff7ed" },
  contact: { email: "hello@goldenaura.in", phone: "+91 98765 43210" },
  updatedAt: new Date(),
};

async function getStore(_req, res) {
  res.json(state);
}

async function updateStore(req, res) {
  const incoming = req.body || {};
  state = { ...state, ...incoming, updatedAt: new Date() };
  res.json(state);
}

async function uploadBrandAsset(req, res) {
  // If using Multer or Cloudinary, handle here. For now, accept a URL in body.
  const url = req.file?.path || req.body?.url || "";
  if (!url) return res.status(400).json({ message: "No file or url provided" });

  // pretend we stored it
  state.logo = url;
  state.updatedAt = new Date();
  res.status(201).json({ url });
}

async function deleteBrandAsset(req, res) {
  // For a real implementation, delete by key or public_id
  const { key } = req.params;
  if (!key) return res.status(400).json({ message: "Key required" });

  // pretend we deleted something
  if (state.logo && state.logo.includes(key)) state.logo = "";
  state.updatedAt = new Date();
  res.json({ success: true });
}

module.exports = {
  getStore,
  updateStore,
  uploadBrandAsset,
  deleteBrandAsset,
};
