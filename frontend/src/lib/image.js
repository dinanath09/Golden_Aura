// frontend/src/lib/image.js
// Normalizes product image value to a usable URL string.
// Works with:
// - product.images = ["http://..."] or [{ url: "..." }, { secure_url: "..." }]
// - product.image = "/uploads/abc.jpg" (relative path) or "uploads/abc.jpg"
// - external absolute URLs
// - null/undefined -> returns fallback

const API_BASE = import.meta.env.VITE_API || import.meta.env.VITE_API_URL || "http://localhost:5000";

export function productImg(raw) {
  const FALLBACK = "/no-image.jpg";
  if (!raw) return FALLBACK;

  let src = raw;

  // if array pick first element
  if (Array.isArray(raw)) src = raw[0];

  // if object try common fields
  if (typeof src === "object" && src !== null) {
    // possible keys: url, secure_url, path, src
    src = src.secure_url || src.url || src.path || src.src || null;
  }

  if (!src) return FALLBACK;

  // If starts with http(s) return as-is
  if (typeof src === "string" && (src.startsWith("http://") || src.startsWith("https://"))) return src;

  // If starts with a slash, assume it's already a correct relative path on the backend
  if (typeof src === "string" && src.startsWith("/")) return `${API_BASE}${src}`;

  // If it looks like 'uploads/...' or 'images/...' add leading slash and API_BASE
  if (typeof src === "string") return `${API_BASE}/${src.replace(/^\/+/, "")}`;

  return FALLBACK;
}
