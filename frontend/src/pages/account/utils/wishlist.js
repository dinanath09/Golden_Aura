// frontend/src/utils/wishlist.js
import { api } from "../lib/api";

/**
 * Check if single product is wished
 * Returns boolean
 */
export async function checkWishlist(productId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await api.get(`/wishlist/check/${productId}`, { headers });
  return res.data?.wished === true;
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await api.post(`/wishlist`, { productId }, { headers });
  return res.data;
}

/**
 * Remove product from wishlist
 * Using DELETE /wishlist/:productId
 */
export async function removeFromWishlist(productId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await api.delete(`/wishlist/${productId}`, { headers });
  return res.data;
}

/**
 * Toggle convenience wrapper: returns new wished boolean
 */
export async function toggleWishlist(productId, token, currentlyWished) {
  if (!token) {
    throw new Error("Not authenticated");
  }
  if (currentlyWished) {
    await removeFromWishlist(productId, token);
    return false;
  } else {
    await addToWishlist(productId, token);
    return true;
  }
}
