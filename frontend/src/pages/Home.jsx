// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

// images used on this page
import aboutBottle from "../assets/about-bottle.JPG";

// hero background as CSS url
const heroBg = new URL("../assets/hero-bottle.jpeg", import.meta.url).href;

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/products?sort=newest");
        setFeatured((data || []).slice(0, 4));
      } catch {
        setFeatured([]);
      }
    })();
  }, []);

  return (
    <div className="space-y-16">
      {/* ------------------- HERO (full-width bg, light overlay) ------------------- */}
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
            Curated perfumes for Men, Women and Unisex. A fragrance for every mood.
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

      {/* ------------------- FEATURED PRODUCTS ------------------- */}
      <Section title="Featured Products">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductMini key={p._id} p={p} />
          ))}
          {!featured.length && (
            <>
              <SkeletonProduct />
              <SkeletonProduct />
              <SkeletonProduct />
              <SkeletonProduct />
            </>
          )}
        </div>
      </Section>

      {/* ------------------- ABOUT THE BRAND ------------------- */}
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
            <h2 className="text-2xl font-serif font-bold mb-2">About the Brand</h2>
            <p className="text-zinc-700 leading-relaxed">
              Golden Aura crafts sophisticated, unforgettable fragrances with a modern
              Indian soul. Every bottle blends meticulous sourcing, artisanal balance,
              and elegant presentation to elevate your daily ritual.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ----------------- small UI bits ----------------- */

function Section({ title, children }) {
  return (
    <section className="rounded-[24px] border bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-serif font-bold mb-4">{title}</h2>
      {children}
    </section>
  );
}

function ProductMini({ p }) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <Link to={`/products/${p.slug}`} className="block">
        <div className="aspect-[4/3] w-full bg-[#f4efe9] flex items-center justify-center">
          {p.images?.[0]?.url ? (
            <img
              src={p.images[0].url}
              alt={p.title}
              className="h-[75%] w-auto object-contain"
            />
          ) : (
            <div className="text-zinc-400">No Image</div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-1">
        <Link to={`/products/${p.slug}`} className="font-medium hover:underline">
          {p.title}
        </Link>
        <div className="text-sm text-zinc-500">{p.category || "Unisex"}</div>
        <div className="text-sm font-semibold">₹{p.price}</div>
        <div className="pt-2">
          <Link
            to={`/products/${p.slug}`}
            className="px-3 py-1.5 rounded-md border hover:bg-zinc-50 text-sm"
          >
            Add to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}

function SkeletonProduct() {
  return (
    <div className="rounded-xl border bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] w-full bg-zinc-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-zinc-100 rounded w-2/3" />
        <div className="h-3 bg-zinc-100 rounded w-1/3" />
        <div className="h-4 bg-zinc-100 rounded w-1/4" />
      </div>
    </div>
  );
}
