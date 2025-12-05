// frontend/src/pages/Products.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

/* Config: backend base (no trailing /api) */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* Safe image resolver */
const productImg = (raw) => {
  const LOCAL_FALLBACK = "/no-image.jpg";
  if (!raw) return LOCAL_FALLBACK;
  let src = raw;
  if (Array.isArray(raw)) src = raw[0];
  if (typeof src === "object" && src !== null) {
    src = src.url || src.path || src.secure_url || src.public_url || null;
  }
  if (!src) return LOCAL_FALLBACK;
  if (typeof src === "string" && (src.startsWith("http://") || src.startsWith("https://"))) return src;
  return `${API_BASE}${src.startsWith("/") ? src : `/${src}`}`;
};

const Price = ({ value }) => {
  try {
    const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    return <div className="font-semibold mt-2">{fmt.format(Number(value) || 0)}</div>;
  } catch {
    return <div className="font-semibold mt-2">₹{value}</div>;
  }
};

/* Helper: make sure each product has a canonical _id */
function normalizeProduct(raw) {
  if (!raw || typeof raw !== "object") return null;
  const p = { ...raw };

  const candidates = [
    p._id,
    p.id,
    p.productId,
    p._doc && p._doc._id,
    p._id && p._id.$oid,
    p.id && (typeof p.id === "object" ? p.id.toString() : p.id),
  ];

  const found = candidates.find((c) => c !== undefined && c !== null && String(c) !== "");
  if (found) p._id = String(found);
  return p;
}

/* Normalize API response to array of products */
function extractProducts(apiResponse) {
  if (!apiResponse) return [];
  if (Array.isArray(apiResponse)) return apiResponse.map(normalizeProduct).filter(Boolean);
  if (Array.isArray(apiResponse.products)) return apiResponse.products.map(normalizeProduct).filter(Boolean);
  if (Array.isArray(apiResponse.items)) return apiResponse.items.map(normalizeProduct).filter(Boolean);
  if (Array.isArray(apiResponse.data)) return apiResponse.data.map(normalizeProduct).filter(Boolean);
  if (apiResponse.product && typeof apiResponse.product === "object") return [normalizeProduct(apiResponse.product)];
  return Object.values(apiResponse)
    .flatMap((v) => (Array.isArray(v) ? v : []))
    .map(normalizeProduct)
    .filter(Boolean);
}

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [wishLoadingId, setWishLoadingId] = useState(null);
  const [wished, setWished] = useState({});
  const nav = useNavigate();

  // use CartContext
  const { add: addToCartContext } = useCart();

  const getToken = () => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/products");
        if (!mounted) return;
        const list = extractProducts(data);
        const missing = list.filter((p) => !p._id);
        if (missing.length) {
          console.warn("Products fetched with missing id fields:", missing);
        }
        setItems(list);
      } catch (err) {
        console.error("Failed to load products:", err);
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!items.length) return;
      const token = getToken();
      if (!token) return;
      try {
        const res = await api.get("/wishlist");
        let list = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (res.data?.wishlist) list = res.data.wishlist;
        else if (res.data?.items) list = res.data.items;
        if (!mounted) return;
        const map = {};
        list.forEach((idOrObj) => {
          const id = typeof idOrObj === "string" ? idOrObj : idOrObj._id || idOrObj.id || idOrObj.productId;
          if (id) map[String(id)] = true;
        });
        setWished(map);
      } catch (err) {
        console.warn("Could not load wishlist:", err?.response?.data || err.message || err);
      }
    })();
    return () => (mounted = false);
  }, [items]);

  // use CartContext for add
  const addToCart = async (product, qty = 1) => {
    const id = product._id || product.id;
    if (!id) {
      alert("Invalid product id — cannot add to cart.");
      return;
    }
    setBusyId(id);
    try {
      const res = await addToCartContext(product, qty);
      if (res && res.ok) {
        alert("Added to cart");
      } else {
        alert("Could not add to cart");
      }
    } catch (err) {
      console.error("addToCart error:", err);
      alert("Could not add to cart");
    } finally {
      setBusyId(null);
    }
  };

  const buyNow = async (product) => {
    const id = product._id || product.id;
    if (!id) {
      alert("Invalid product id — cannot buy.");
      return;
    }
    setBusyId(id);
    try {
      await addToCartContext(product, 1);
    } catch (err) {
      console.warn("buyNow fallback:", err);
    } finally {
      setBusyId(null);
      nav("/checkout");
    }
  };

  const toggleWishlist = async (productId) => {
    setWishLoadingId(productId);
    try {
      const token = getToken();
      if (!token) {
        alert("Please login to use the wishlist.");
        nav("/login");
        return;
      }
      const isWished = !!wished[productId];
      if (!isWished) {
        await api.post("/wishlist", { productId });
        setWished((s) => ({ ...s, [productId]: true }));
      } else {
        try {
          await api.delete(`/wishlist/${productId}`);
        } catch (e2) {
          await api.delete("/wishlist", { data: { productId } });
        }
        setWished((s) => {
          const cp = { ...s };
          delete cp[productId];
          return cp;
        });
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      if (err?.response?.status === 401) {
        alert("Please login to use the wishlist.");
        nav("/login");
      } else {
        alert(err?.response?.data?.message || "Wishlist action failed");
      }
    } finally {
      setWishLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border rounded overflow-hidden animate-pulse">
              <div className="bg-gray-200 h-64 w-full" />
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-600">No products yet — add from admin panel.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((p) => {
            const id = p._id || p.id;
            const imgUrl = productImg(p.images || p.image);
            const isBusy = busyId === id;
            const isWishLoading = wishLoadingId === id;
            const isWished = !!wished[String(id)];

            return (
              <div key={String(id || Math.random())} className="border rounded overflow-hidden bg-white flex flex-col">
                {id ? (
                  <Link to={`/products/${encodeURIComponent(id)}`} className="block">
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={p.title || p.name || "Product"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/no-image.jpg";
                        }}
                      />
                    </div>
                  </Link>
                ) : (
                  <div className="w-full aspect-square bg-gray-50 flex items-center justify-center text-zinc-400">
                    No ID — contact admin
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-lg">{p.title || p.name || "Untitled product"}</div>
                      <div className="text-sm text-gray-600 mt-1">{p.type} · {p.category}</div>
                    </div>

                    <button
                      onClick={() => id && toggleWishlist(id)}
                      disabled={isWishLoading || !id}
                      className={`ml-2 p-2 rounded ${isWished ? "text-red-600" : "text-gray-400"}`}
                      title={isWished ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      {isWishLoading ? "..." : isWished ? "♥" : "♡"}
                    </button>
                  </div>

                  <div className="mt-4"><Price value={p.price} /></div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => addToCart(p, 1)}
                      disabled={isBusy || !id}
                      className="flex-1 px-3 py-2 bg-black text-white rounded disabled:opacity-50"
                    >
                      {isBusy ? "Adding..." : "Add to Cart"}
                    </button>

                    <button
                      onClick={() => buyNow(p)}
                      disabled={isBusy || !id}
                      className="px-3 py-2 border rounded disabled:opacity-50"
                    >
                      {isBusy ? "Processing..." : "Buy Now"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
