import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function ProductCard({ p }) {
  const navigate = useNavigate();
  const { add } = useCart();
  const { user } = useAuth();

  const [wishBusy, setWishBusy] = useState(false);
  const [inWishlist, setInWishlist] = useState(!!p?.inWishlist);

  const onAddToCart = () => add(p, 1);

  const onBuyNow = () => {
    add(p, 1);
    // change to "/cart" if you don't have checkout yet
    navigate("/checkout", { replace: true });
  };

  const onToggleWishlist = async () => {
    if (!user) return navigate("/login", { state: { from: "/products" } });
    if (!p?._id || wishBusy) return;
    setWishBusy(true);
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${p._id}`);
        setInWishlist(false);
      } else {
        await api.post("/wishlist", { product: p._id });
        setInWishlist(true);
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Wishlist action failed");
    } finally {
      setWishBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-4 hover:shadow-sm transition">
      <Link to={`/products/${p.slug}`} className="block">
        <div className="aspect-square rounded-xl bg-amber-50 flex items-center justify-center overflow-hidden">
          <img
            src={p?.images?.[0] || "/placeholder.png"}
            alt={p.title}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="mt-3">
          <div className="text-sm text-zinc-500">{p.brand || "Golden Aura"}</div>
          <div className="font-medium line-clamp-1">{p.title}</div>
          <div className="mt-1 text-lg font-semibold">₹{p.price}</div>
        </div>
      </Link>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={onAddToCart}
          className="px-3 py-2 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700"
          title="Add to Cart"
        >
          Add
        </button>
        <button
          onClick={onBuyNow}
          className="px-3 py-2 text-sm rounded-lg border border-amber-600 text-amber-700 hover:bg-amber-50"
          title="Buy Now"
        >
          Buy
        </button>
        <button
          onClick={onToggleWishlist}
          disabled={wishBusy}
          className={`px-3 py-2 text-sm rounded-lg border ${
            inWishlist
              ? "border-rose-500 text-rose-600 hover:bg-rose-50"
              : "border-amber-600 text-amber-700 hover:bg-amber-50"
          } ${wishBusy ? "opacity-60" : ""}`}
          title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {inWishlist ? "♥" : "♡"}
        </button>
      </div>
    </div>
  );
}
