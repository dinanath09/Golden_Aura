// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png"; // adjust if you use a different path

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false); // account menu
  const [collectionOpen, setCollectionOpen] = useState(false); // collection dropdown
  const menuRef = useRef(null);
  const collectionRef = useRef(null);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (collectionRef.current && !collectionRef.current.contains(e.target)) {
        setCollectionOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout?.();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      try {
        navigate("/login", { replace: true });
      } catch {}
      setMenuOpen(false);
    }
  };

  const initial = (user?.name || "U").toString().trim()[0]?.toUpperCase?.() || "U";

  const collectionMega = [
    {
      title: "Gender",
      items: [
        { label: "Men", href: "/products?category=men" },
        { label: "Women", href: "/products?category=women" },
        { label: "Unisex", href: "/products?category=unisex" },
      ],
    },
    {
      title: "Top Picks",
      items: [
        { label: "Best sellers", href: "/products?sort=bestseller" },
        { label: "New arrivals", href: "/products?sort=newest" },
        { label: "Gift sets", href: "/gifts" },
      ],
    },
    {
      title: "By Type",
      items: [
        { label: "Attar", href: "/products?type=attar" },
        { label: "Spray", href: "/products?type=spray" },
        { label: "Oud", href: "/products?type=oud" },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-pink-500 text-white shadow-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* LEFT: Logo + Menu */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3 select-none">
                <div
                  className={`logo-wrap rounded-full overflow-hidden border-2 border-white/90 shadow-sm ${
                    logoLoaded ? "logo-loaded" : ""
                  }`}
                >
                  <img
                    src={logo}
                    alt="Golden Aura"
                    className="logo-img w-14 h-14 object-contain"
                    onLoad={() => setLogoLoaded(true)}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                      setLogoLoaded(true);
                    }}
                  />
                </div>

                <div className="hidden sm:block leading-tight">
                  <div className="brand-title text-3xl font-extrabold text-white">
                    Golden Aura
                  </div>
                  <div className="text-xs text-white/90 -mt-1">
                    Luxury Fragrances
                  </div>
                </div>
              </Link>

              {/* Desktop Menu */}
              <nav className="hidden md:flex items-center gap-3">
                {/* Collection - with accessible mega dropdown */}
                <div
                  className="relative"
                  ref={collectionRef}
                  onMouseEnter={() => setCollectionOpen(true)}
                  onMouseLeave={() => setCollectionOpen(false)}
                >
                  <button
                    aria-haspopup="menu"
                    aria-expanded={collectionOpen}
                    onClick={() => setCollectionOpen((s) => !s)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setCollectionOpen(false);
                      if (e.key === "Enter" || e.key === " ") setCollectionOpen((s) => !s);
                    }}
                    className="px-3 py-2 rounded-md text-sm text-white/95 hover:bg-white/10 inline-flex items-center gap-2"
                  >
                    Collection
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.04 1.08l-4.25 4a.75.75 0 01-1.04 0l-4.25-4a.75.75 0 01-.02-1.06z" />
                    </svg>
                  </button>

                  {collectionOpen && (
                    <div
                      role="menu"
                      aria-label="Collection"
                      className="absolute left-0 mt-2 w-80 bg-white text-zinc-800 rounded-lg shadow-lg ring-1 ring-black/5 p-4 grid grid-cols-3 gap-4 z-50"
                    >
                      {collectionMega.map((col) => (
                        <div key={col.title}>
                          <div className="text-sm font-semibold mb-2">{col.title}</div>
                          <ul className="space-y-1">
                            {col.items.map((it) => (
                              <li key={it.label}>
                                <Link
                                  to={it.href}
                                  onClick={() => setCollectionOpen(false)}
                                  className="block px-1 py-1 text-sm hover:text-amber-600"
                                >
                                  {it.label}
                                  {it.sub && <div className="text-xs text-zinc-400">{it.sub}</div>}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm ${
                      isActive ? "text-white" : "text-white/95 hover:bg-white/10"
                    }`
                  }
                >
                  About
                </NavLink>

                <NavLink
                  to="/gifts"
                  className="px-3 py-2 rounded-md text-sm text-white/95 hover:bg-white/10"
                >
                  Gifts
                </NavLink>
              </nav>
            </div>

            {/* CENTER: Search Bar */}
            <div className="hidden lg:flex flex-1 justify-center px-6">
              <div className="w-full max-w-lg relative">
                <input
                  type="search"
                  placeholder="Search fragrances, brands..."
                  className="w-full rounded-full px-4 py-2 bg-white/95 text-zinc-800 border border-white/30 shadow-sm focus:ring-2 focus:ring-amber-300 outline-none"
                />
              </div>
            </div>

            {/* RIGHT: Account + Cart */}
            <div className="flex items-center gap-3">
              {/* Avatar / Account Menu */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  {user ? (
                    <>
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="avatar"
                          className="h-8 w-8 rounded-full object-cover border-2 border-white/90"
                          onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                        />
                      ) : (
                        <div className="avatar-initial inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/20 text-white font-medium">
                          {initial}
                        </div>
                      )}

                      <span className="hidden sm:block text-white/95">
                        {user?.name?.split?.(" ")?.[0] ?? "Account"}
                      </span>
                    </>
                  ) : (
                    <Link to="/login" className="text-white/95">
                      Login
                    </Link>
                  )}
                </button>

                {menuOpen && user && (
                  <div className="absolute right-0 mt-2 w-44 bg-white text-zinc-800 rounded-lg shadow-lg ring-1 ring-black/5 z-50">
                    <Link
                      to="/account"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-zinc-50"
                    >
                      My Profile
                    </Link>

                    <Link
                      to="/account/orders"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-zinc-50"
                    >
                      Orders
                    </Link>

                    {/* Wishlist item removed */}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-zinc-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10"
              >
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 7h12l-2-7"
                  />
                </svg>
                <span className="text-sm font-medium text-white">Cart</span>
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-white text-amber-600 text-xs px-2 py-0.5">
                  {count || 0}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
