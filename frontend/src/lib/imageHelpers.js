// frontend/src/lib/imageHelpers.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Accepts:
 *  - a string like "/uploads/abc.jpg"
 *  - an object like { url: "/uploads/abc.jpg" }
 *  - an array: ["/uploads/1.jpg", {url:...}]
 * Returns a safe absolute URL or local fallback "/no-image.jpg"
 */
export function buildImageUrl(raw) {
  const LOCAL_FALLBACK = "/no-image.jpg";

  if (!raw) return LOCAL_FALLBACK;

  // if array, take first element
  if (Array.isArray(raw)) raw = raw[0];

  // if object, pick url/path/secure_url
  if (typeof raw === "object" && raw !== null) {
    raw = raw.url || raw.path || raw.secure_url || null;
  }

  if (!raw || typeof raw !== "string") return LOCAL_FALLBACK;

  // absolute URL
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  // relative path from backend (ensure leading slash)
  return `${API_BASE}${raw.startsWith("/") ? raw : `/${raw}`}`;
}
