// src/pages/account/Wishlist.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

/* --- optional: same helper as Home for proper image URLs --- */
const RAW = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();
const API_BASE = RAW.replace(/\/+$/, "");

function buildImageUrl(url) {
  if (!url) return "/no-image.jpg";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
}

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/wishlist");
        console.log("Wishlist page API data:", data);

        // your controller returns: { ok: true, products: [...] }
        const list = Array.isArray(data?.products) ? data.products : [];
        setProducts(list);
      } catch (err) {
        console.error("Load wishlist error:", err);
        const status = err?.response?.status;

        if (status === 401) {
          setError("Please log in to see your wishlist.");
        } else {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Could not load wishlist."
          );
        }

        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    // This div is the RIGHT side panel in your Account layout
    <div className="rounded-[24px] border bg-white p-6 sm:p-8 flex-1">
      <h2 className="text-xl font-semibold mb-4">Your Wishlist</h2>

      {loading && <p>Loading wishlist...</p>}

      {!loading && error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && !products.length && (
        <p>Your wishlist is empty.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            const imgUrl = buildImageUrl(p.images?.[0]?.url);
            return (
              <Link
                key={p._id}
                to={`/products/${p._id}`}
                className="rounded-2xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="aspect-[4/5] bg-[#f7f5f1] overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <div className="text-lg font-medium">{p.title}</div>
                  <div className="text-sm text-zinc-600">
                    {p.type} · {p.category}
                  </div>
                  <div className="text-lg font-semibold mt-1">₹{p.price}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
