// frontend/src/components/WishHeart.jsx
import { useEffect, useState } from "react";
import { toggleWishlist, checkWishlist } from "../utils/wishlist";
import { useAuth } from "../context/AuthContext"; // if you have this

export default function WishHeart({ productId, tokenProp }) {
  // tokenProp allows explicit override; otherwise try context; otherwise localStorage fallback
  const auth = useAuth?.() || null; // safe if hook missing
  const token = tokenProp || auth?.token || localStorage.getItem("token") || null;

  const [wished, setWished] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!token) {
          if (mounted) setWished(false);
          return;
        }
        const isW = await checkWishlist(productId, token);
        if (mounted) setWished(isW);
      } catch (e) {
        console.error("checkWishlist failed", e);
      }
    })();
    return () => { mounted = false; };
  }, [productId, token]);

  const onClick = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Please login to add to wishlist");
      return;
    }
    setBusy(true);
    try {
      const newState = await toggleWishlist(productId, token, wished);
      setWished(newState);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Wishlist failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy}
      aria-pressed={wished}
      title={wished ? "Remove from wishlist" : "Add to wishlist"}
      className="px-2 py-1"
    >
      <span style={{ fontSize: 18 }}>{wished ? "♥" : "♡"}</span>
    </button>
  );
}
