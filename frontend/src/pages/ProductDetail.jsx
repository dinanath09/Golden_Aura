// src/pages/ProductDetail.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const safeImg = (raw) => {
  const FALLBACK = "/no-image.jpg";
  if (!raw) return FALLBACK;
  let src = raw;
  if (Array.isArray(raw)) src = raw[0];
  if (typeof src === "object" && src !== null) src = src.url || src.path || src.secure_url || null;
  if (!src) return FALLBACK;
  if (typeof src === "string" && (src.startsWith("http://") || src.startsWith("https://"))) return src;
  return `${API_BASE}${src.startsWith("/") ? src : `/${src}`}`;
};

function looksLikeObjectId(id) {
  if (!id || typeof id !== "string") return false;
  const s = id.trim();
  if (s === "" || s.toLowerCase() === "undefined" || s.toLowerCase() === "null") return false;
  return /^[0-9a-fA-F]{24}$/.test(s);
}

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { add: addToCartContext } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const loadProduct = useCallback(async (prodId) => {
    if (!looksLikeObjectId(prodId)) {
      setErrMsg("Product ID is missing or invalid.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrMsg("");
    try {
      const res = await api.get(`/products/${encodeURIComponent(prodId)}`);
      const body = res.data;
      const p = body?.product ?? (body?.ok && body?.product) ?? body;
      if (!p) setErrMsg("Product not found.");
      else setProduct(p);
    } catch (err) {
      console.error("Failed to load product:", err);
      const status = err?.response?.status;
      if (status === 400) setErrMsg("Invalid product ID requested.");
      else if (status === 404) setErrMsg("Product not found.");
      else setErrMsg(err?.response?.data?.message || "Failed to load product.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!looksLikeObjectId(id)) {
      setErrMsg("Product id missing or invalid.");
      setLoading(false);
      return;
    }
    loadProduct(id);
  }, [id, loadProduct]);

  const handleAddToCart = async (qty = 1) => {
    if (!product || !product._id) {
      alert("Product not ready");
      return;
    }
    const res = await addToCartContext(product, qty);
    if (res && res.ok) {
      alert("Added to cart");
      nav("/cart");
    } else {
      alert("Could not add to cart");
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="text-lg">Loading product…</div>
      </div>
    );
  }

  if (errMsg) {
    return (
      <div className="py-12 text-center">
        <div className="text-red-600 font-medium mb-2">{errMsg}</div>
        <Link to="/products" className="text-amber-600 hover:underline">Back to collection</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-12 text-center">
        <div className="text-zinc-600">Product not found.</div>
        <Link to="/products" className="text-amber-600 hover:underline mt-2 inline-block">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="p-6 grid md:grid-cols-2 gap-8">
      <div className="rounded border bg-white p-4 flex items-center justify-center">
        <img
          src={safeImg(product.images || product.image)}
          alt={product.title || product.name}
          className="max-h-[520px] object-contain"
          onError={(e) => (e.currentTarget.src = "/no-image.jpg")}
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{product.title || product.name}</h1>
        <div className="text-sm text-zinc-600">{product.type} · {product.category}</div>
        <div className="text-2xl font-bold">₹{Number(product.price || 0).toFixed(2)}</div>

        <div className="text-zinc-700 leading-relaxed">{product.description}</div>

        <div className="flex gap-3 mt-4">
          <button onClick={() => handleAddToCart(1)} className="px-4 py-2 bg-amber-600 text-white rounded">
            Add to Cart
          </button>
          <button onClick={async () => { await handleAddToCart(1); nav("/checkout"); }} className="px-4 py-2 border rounded">
            Buy Now
          </button>
        </div>

        <div className="text-sm text-zinc-500">
          Stock: {product.stock ?? "N/A"} • Rating: {product.rating ?? "—"}
        </div>
      </div>
    </div>
  );
}
