// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

import aboutBottle from "../assets/about-bottle.JPG";

const heroBg = new URL("../assets/hero-bottle.jpeg", import.meta.url).href;

// ---- API base + robust image resolver ----
const RAW = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();
const API_BASE = RAW.replace(/\/+$/, "");

/**
 * Accepts whatever is in product.images and tries very hard
 * to turn it into a working <img src="..."> URL.
 *
 * It supports:
 * - array of strings
 * - array of objects { url, path, secure_url, location }
 * - single string
 * - single object
 */
function resolveImage(raw) {
  if (!raw) return "/no-image.jpg";

  let src = raw;

  // If it's an array (most common case: product.images)
  if (Array.isArray(raw)) {
    if (!raw.length) return "/no-image.jpg";
    src = raw[0];
  }

  // If it's an object, pull the interesting field out
  if (src && typeof src === "object") {
    src =
      src.url ||
      src.path ||
      src.secure_url ||
      src.location ||
      src.key ||
      null;
  }

  if (!src || typeof src !== "string") return "/no-image.jpg";

  // Already an absolute URL (Cloudinary, S3, etc.)
  if (/^https?:\/\//i.test(src)) return src;

  // Relative path coming from backend (/uploads/..., public/..., etc.)
  return `${API_BASE}${src.startsWith("/") ? src : `/${src}`}`;
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/products?sort=newest");

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];

        setFeatured(list.slice(0, 4));
      } catch (err) {
        console.error("Error loading featured products", err);
        setError("Failed to load featured products.");
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-16">
      {/* HERO SECTION */}
      <section className="relative w-full">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${heroBg}')` }}
        />
        <div className="absolute inset-0 bg-[#f7efe7]/40" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28 lg:py-32">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight max-w-2xl">
            <span className="text-amber-600 drop-shadow-[0_0_6px_rgba(255,196,0,0.6)]">
              Elevate your aura
            </span>
            <br />
            <span className="text-zinc-900">with luxury fragrances</span>
          </h1>

          <p className="mt-4 text-lg text-zinc-800 max-w-xl">
            Curated perfumes for Men, Women and Unisex. A fragrance for every
            mood.
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              to="/products"
              className="px-5 py-2.5 rounded-md bg-zinc-900 text-white hover:bg-black shadow-md"
            >
              Explore Fragrances
            </Link>
            <Link
              to="/gifts"
              className="px-5 py-2.5 rounded-md border border-zinc-400 bg-white/80 hover:bg-white text-zinc-800 shadow-sm"
            >
              Gifts
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <Section title="Featured Products">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkeletonProduct />
            <SkeletonProduct />
            <SkeletonProduct />
            <SkeletonProduct />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && !featured.length && (
          <p className="text-sm text-zinc-500">
            No featured products available yet.
          </p>
        )}

        {!loading && !error && featured.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductMini key={p._id} p={p} />
            ))}
          </div>
        )}
      </Section>

      {/* ABOUT SECTION */}
      <section className="rounded-[28px] border bg-[#f7efe7] p-6 sm:p-10">
        <div className="grid lg:grid-cols-[360px_1fr] items-center gap-8">
          <div className="rounded-xl overflow-hidden border bg-white flex items-center justify-center">
            {aboutBottle ? (
              <img
                src={aboutBottle}
                alt="About Golden Aura"
                className="h-64 w-auto object-contain"
              />
            ) : (
              <div className="text-zinc-400 p-10">Add about-bottle.png</div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-2">
              About the Brand
            </h2>
            <p className="text-zinc-700 leading-relaxed">
              Golden Aura crafts sophisticated, unforgettable fragrances with a
              modern Indian soul. Every bottle blends meticulous sourcing,
              artisanal balance, and elegant presentation to elevate your daily
              ritual.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* --- Reusable Section Wrapper --- */
function Section({ title, children }) {
  return (
    <section className="rounded-[24px] border bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-serif font-bold mb-4">{title}</h2>
      {children}
    </section>
  );
}

/* --- Product Card With Wishlist + Auth-aware buttons --- */
function ProductMini({ p }) {
  const [wishLoading, setWishLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // ✅ use robust image resolver here
  const imgUrl = resolveImage(p.images);
  const link = `/products/${p._id}`;

  /* LOAD WISHLIST STATUS ON PAGE LOAD (only if logged in) */
  useEffect(() => {
    (async () => {
      try {
        if (!isLoggedIn) {
          setInWishlist(false);
          return;
        }
        const { data } = await api.get("/wishlist");
        const ids = (data?.products || []).map((x) => x._id);
        setInWishlist(ids.includes(p._id));
      } catch (err) {
        // 401 is normal if cookies are blocked on cross-origin, just ignore
        if (err?.response?.status !== 401) {
          console.error("Wishlist preload error", err);
        }
      }
    })();
  }, [p._id, isLoggedIn]);

  /* TOGGLE WISHLIST */
  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishLoading) return;

    if (!isLoggedIn) {
      alert("Please log in to use wishlist.");
      return;
    }

    try {
      setWishLoading(true);

      if (inWishlist) {
        const res = await api.delete(`/wishlist/${p._id}`);
        console.log("Removed from wishlist:", res?.data);
        setInWishlist(false);
      } else {
        const res = await api.post("/wishlist", { productId: p._id });
        console.log("Added to wishlist:", res?.data);
        setInWishlist(true);
      }
    } catch (err) {
      console.error("Wishlist toggle error", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Could not update wishlist"
      );
    } finally {
      setWishLoading(false);
    }
  };

  /* ADD TO CART (login required) */
  const handleAddToCart = (e) => {
    e.preventDefault();

    const target = link; // /products/:id

    if (!isLoggedIn) {
      const redirect = encodeURIComponent(target);
      navigate(`/login?redirect=${redirect}`);
      return;
    }

    navigate(target);
  };

  /* BUY NOW (login required) */
  const handleBuyNow = (e) => {
    e.preventDefault();

    const target = `${link}?buy=1`;

    if (!isLoggedIn) {
      const redirect = encodeURIComponent(target);
      navigate(`/login?redirect=${redirect}`);
      return;
    }

    navigate(target);
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="relative">
        <Link to={link}>
          <div className="aspect-[4/5] bg-[#f7f5f1] overflow-hidden">
            <img
              src={imgUrl}
              alt={p.title}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 shadow-sm hover:bg-white"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          disabled={wishLoading}
        >
          <span className={inWishlist ? "text-red-500" : "text-zinc-400"}>
            {inWishlist ? "♥" : "♡"}
          </span>
        </button>
      </div>

      <div className="p-4 space-y-1">
        <Link
          to={link}
          className="text-lg font-medium hover:underline inline-block"
        >
          {p.title}
        </Link>

        <div className="text-sm text-zinc-600">
          {p.type} · {p.category}
        </div>

        <div className="text-lg font-semibold mt-1">₹{p.price}</div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 px-3 py-2 rounded-md bg-black text-white text-sm text-center hover:bg-zinc-900"
          >
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 px-3 py-2 rounded-md border text-sm text-center hover:bg-zinc-50"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Skeleton Loader --- */
function SkeletonProduct() {
  return (
    <div className="rounded-2xl border bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/5] w-full bg-zinc-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-zinc-200 rounded w-3/4" />
        <div className="h-3 bg-zinc-200 rounded w-1/2" />
        <div className="h-4 bg-zinc-200 rounded w-1/3" />
        <div className="h-8 bg-zinc-200 rounded w-full mt-2" />
      </div>
    </div>
  );
}
