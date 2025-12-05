// frontend/src/pages/Checkout.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

/**
 * Checkout page:
 * - collects delivery details (required)
 * - calls /api/payments/create-order (server creates Razorpay order, returns order + key_id)
 * - opens Razorpay checkout using returned order and key
 * - on successful payment calls /api/payments/verify with payment fields + delivery + items
 */

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const el = document.createElement("script");
    el.id = "razorpay-script";
    el.src = "https://checkout.razorpay.com/v1/checkout.js";
    el.onload = () => resolve(true);
    el.onerror = () => resolve(false);
    document.body.appendChild(el);
  });

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    pincode: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!delivery.name?.trim()) e.name = "Name required";
    if (!delivery.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email))
      e.email = "Valid email required";
    if (!delivery.phone?.trim() || !/^\d{10,15}$/.test(delivery.phone))
      e.phone = "Valid phone required";
    if (!delivery.pincode?.trim() || !/^\d{5,6}$/.test(delivery.pincode))
      e.pincode = "Valid pincode required";
    if (!delivery.address?.trim()) e.address = "Address required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (k, v) => {
    setDelivery((s) => ({ ...s, [k]: v }));
    setErrors((s) => ({ ...s, [k]: undefined }));
  };

  const onPay = async () => {
    if (!items || items.length === 0) {
      alert("Cart is empty");
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      const amountRupees = subtotal; // subtotal should already be rupees (e.g. 700)
      // Prepare items for backend (id, title, price, qty)
      const payloadItems = items.map((it) => ({
        productId: it.productId ?? it._id ?? it.id,
        title: it.title,
        price: Number(it.price) || 0,
        qty: Number(it.qty) || 1,
      }));

      // create order on backend
      const createRes = await api.post("/payments/create-order", {
        amount: amountRupees,
        items: payloadItems,
      });

      if (!createRes?.data?.order) throw new Error("No order returned from server");
      const order = createRes.data.order;
      // prefer backend-provided key_id (safer), fallback to Vite env (public key)
      const razorpayKey = order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "";

      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Razorpay SDK failed to load");

      const options = {
        key: razorpayKey,
        amount: order.amount, // in paise
        currency: order.currency || "INR",
        name: "Golden Aura",
        description: `Order ${order.id}`,
        order_id: order.id,
        prefill: {
          name: delivery.name,
          email: delivery.email,
          contact: delivery.phone,
        },
        notes: {
          // pass delivery info so it appears in Razorpay dashboard
          address: delivery.address,
          pincode: delivery.pincode,
        },
        handler: async function (response) {
          try {
            // verify on server and save the final order record
            const verifyRes = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: payloadItems,
              delivery, // save address with order
            });

            if (verifyRes.data?.ok) {
              // clear cart and navigate to success/orders page
              clear();
              alert("Payment successful. Thank you!");
              navigate(`/account/orders/${verifyRes.data.order?._id || verifyRes.data.order?.id || ""}`);
            } else {
              alert(verifyRes.data?.message || "Payment verification failed");
            }
          } catch (verifyErr) {
            console.error("Verify failed:", verifyErr);
            alert(verifyErr?.response?.data?.message || verifyErr.message || "Verification failed");
          }
        },
        modal: {
          ondismiss: function () {
            // user closed checkout
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-4">Review your items</h2>

          <ul className="divide-y">
            {items.map((it) => (
              <li key={it.productId ?? it._id ?? it.id} className="py-5 flex items-center gap-4">
                <img src={it.image || "/no-image.jpg"} alt={it.title} className="h-20 w-20 rounded object-cover border" />
                <div className="flex-1">
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm text-zinc-600">Price: ₹{Number(it.price).toFixed(2)}</div>
                </div>
                <div className="text-right font-semibold">₹{(Number(it.qty) * Number(it.price)).toFixed(2)}</div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-3">Delivery details (required)</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  value={delivery.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="Full name"
                  className="w-full border rounded px-3 py-2"
                />
                {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
              </div>

              <div>
                <input
                  value={delivery.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  placeholder="Phone"
                  className="w-full border rounded px-3 py-2"
                />
                {errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}
              </div>

              <div>
                <input
                  value={delivery.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="Email"
                  className="w-full border rounded px-3 py-2"
                />
                {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
              </div>

              <div>
                <input
                  value={delivery.pincode}
                  onChange={(e) => onChange("pincode", e.target.value)}
                  placeholder="Pincode"
                  className="w-full border rounded px-3 py-2"
                />
                {errors.pincode && <div className="text-red-600 text-sm mt-1">{errors.pincode}</div>}
              </div>
            </div>

            <div className="mt-3">
              <textarea
                value={delivery.address}
                onChange={(e) => onChange("address", e.target.value)}
                placeholder="Address (street, city, state, etc.)"
                className="w-full border rounded px-3 py-2 min-h-[80px]"
              />
              {errors.address && <div className="text-red-600 text-sm mt-1">{errors.address}</div>}
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border bg-white p-6 h-fit">
          <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-medium">₹{Number(subtotal).toFixed(2)}</span>
          </div>

          <div className="mt-8">
            <button
              onClick={onPay}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl text-white font-semibold"
              style={{
                background: "linear-gradient(90deg,#f59e0b,#ef476f)", // amber -> pinkish
              }}
            >
              {loading ? "Processing..." : `Buy (${items.reduce((n, it) => n + (Number(it.qty)||0), 0)} items) — ₹${Number(subtotal).toFixed(2)}`}
            </button>
          </div>

          <button onClick={() => { /* optional: clear cart */ }} className="mt-4 w-full border rounded px-4 py-2">
            Clear Cart
          </button>
        </aside>
      </div>
    </div>
  );
}
