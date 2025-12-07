// frontend/src/components/WishHeart.jsx
import { useEffect, useState } from "react";
import { toggleWishlist, checkWishlist } from "../utils/wishlist";
import { useAuth } from "../context/AuthContext";

export default function WishHeart({ productId }) {
  const { token } = useAuth(); // <-- FIXED: call correctly
  const realToken = token || localStorage.getItem("token") || null;

  const [wished, setWished] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!realToken) {
          if (alive) setWished(false);
          return;
        }

        const isWished = await checkWishlist(productId, realToken);
        if (alive) setWished(isWished);
      } catch (err) {
        console.error("Wishlist load error:", err);
      }
    })();

    return () => (alive = false);
  }, [productId, realToken]);

  const handleClick = async (e) => {
    e.preventDefault();

    if (!realToken) {
      alert("Please login to use wishlist.");
      return;
    }

    setBusy(true);
    try {
      const newState = await toggleWishlist(productId, realToken, wished);
      setWished(newState);
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      alert(err?.response?.data?.message || "Wishlist action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      className="absolute top-3 right-3 bg-white/80 rounded-full p-2 shadow"
    >
      <span className={wished ? "text-red-500" : "text-gray-400"} style={{ fontSize: 20 }}>
        {wished ? "♥" : "♡"}
      </span>
    </button>
  );
}
