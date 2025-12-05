// frontend/src/components/BuyProduct.jsx
import React from "react";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function BuyProduct({ product, onPurchaseSuccess }) {
  const { items, subtotal, count, clear } = useCart();

  const buyNow = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) return alert("Razorpay SDK failed to load. Check your internet connection.");
    try {
      const itemsToBuy = product
        ? [{ productId: product._id ?? product.productId, name: product.title ?? product.name, price: Number(product.price) || 0, qty: product.qty || 1 }]
        : items.map((i) => ({ productId: i.productId, name: i.title, price: Number(i.price), qty: Number(i.qty) }));

      const amountRupees = product ? Number(product.price || 0) : Number(subtotal || 0);
      if (!amountRupees || amountRupees <= 0) return alert("Cart is empty or invalid amount");

      const createRes = await api.post("/payments/create-order", { amount: amountRupees, items: itemsToBuy });
      const order = createRes.data?.order;
      if (!order || !order.id) throw new Error("Failed to create order on server");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_xxx",
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Golden Aura",
        description: "Purchase",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: itemsToBuy,
            });

            if (verifyRes.data?.ok) {
              alert("Payment successful!");
              clear();
              onPurchaseSuccess && onPurchaseSuccess(verifyRes.data.order);
            } else {
              alert("Payment verification failed on server.");
            }
          } catch (err) {
            console.error("Verify error:", err);
            alert("Error verifying payment.");
          }
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#D97706" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      const message = err?.response?.data?.message || err.message || "Payment initiation failed";
      alert(message);
    }
  };

  const qty = product ? product.qty || 1 : count;
  const itemLabel = qty === 1 ? "item" : "items";
  const buttonText = product ? "Buy Now" : `Buy ${qty} ${itemLabel} — ₹${(Number(subtotal) || 0).toFixed(2)}`;

  return (
    <button
      onClick={buyNow}
      aria-label={buttonText}
      type="button"
      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-amber-500 via-amber-600 to-rose-500 text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-transform duration-150 ease-out focus:outline-none focus:ring-4 focus:ring-amber-200/40"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 7h12l-2-7M10 21a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
      <span>{buttonText}</span>
    </button>
  );
}
