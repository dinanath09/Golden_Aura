// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../lib/api";

const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  const count = useMemo(() => items.reduce((s, it) => s + (Number(it.qty) || 0), 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0), [items]);

  const add = useCallback(
    async (product, qty = 1) => {
      // normalize
      const id = product._id || product.id || product.productId;
      if (!id) return { ok: false, message: "Missing product id" };

      setItems((prev) => {
        const idx = prev.findIndex((p) => String(p.productId) === String(id));
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], qty: Number(copy[idx].qty || 0) + Number(qty || 1) };
          return copy;
        }
        const image =
          (Array.isArray(product.images) && (product.images[0]?.url || product.images[0])) ||
          product.image ||
          "/no-image.jpg";
        return [...prev, { productId: String(id), qty: Number(qty || 1), title: product.title || product.name || "Product", price: Number(product.price || 0), image }];
      });

      // try server sync non-blocking
      try {
        await api.post("/cart", { productId: id, qty });
      } catch {
        // ignore - fallback to local
      }

      return { ok: true };
    },
    [setItems]
  );

  const setQty = useCallback(
    async (productId, newQty) => {
      const qty = Number(newQty || 0);
      setItems((prev) => {
        if (qty <= 0) return prev.filter((it) => String(it.productId) !== String(productId));
        const idx = prev.findIndex((it) => String(it.productId) === String(productId));
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty };
        return copy;
      });
      try {
        await api.put("/cart", { productId, qty });
      } catch {}
    },
    [setItems]
  );

  const remove = useCallback(
    async (productId) => {
      setItems((prev) => prev.filter((it) => String(it.productId) !== String(productId)));
      try {
        await api.delete("/cart", { data: { productId } });
      } catch {}
    },
    [setItems]
  );

  const clear = useCallback(async () => {
    setItems([]);
    try {
      await api.delete("/cart/clear");
    } catch {}
  }, [setItems]);

  const value = useMemo(() => ({ items, add, setQty, remove, clear, count, subtotal }), [items, add, setQty, remove, clear, count, subtotal]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
