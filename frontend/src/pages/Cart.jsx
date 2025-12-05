// frontend/src/pages/Cart.jsx
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, setQty, remove, subtotal } = useCart();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="py-12 text-center">
        <div className="text-xl font-semibold">Your cart is empty</div>
        <Link to="/products" className="mt-3 inline-block px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      <section className="rounded-2xl border bg-white p-4 sm:p-6">
        <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
        <ul className="divide-y">
          {items.map((it) => (
            <li key={it.productId} className="py-4 flex items-center gap-4">
              <img
                src={it.image || "/no-image.jpg"}
                alt={it.title}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/no-image.jpg"; }}
                className="h-20 w-20 rounded object-cover border"
              />
              <div className="flex-1">
                <div className="font-medium">{it.title}</div>
                <div className="text-sm text-zinc-600">Price: ₹{Number(it.price).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(it.productId, it.qty - 1)} className="px-2 py-1 border rounded" aria-label="Decrease">−</button>
                <input value={it.qty} onChange={(e) => setQty(it.productId, Number(e.target.value) || 1)} className="w-14 text-center border rounded py-1" />
                <button onClick={() => setQty(it.productId, it.qty + 1)} className="px-2 py-1 border rounded" aria-label="Increase">+</button>
              </div>
              <div className="w-28 text-right font-semibold">₹{(it.qty * Number(it.price)).toFixed(2)}</div>
              <button onClick={() => remove(it.productId)} className="ml-3 text-sm text-red-600 hover:underline">Remove</button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="rounded-2xl border bg-white p-4 sm:p-6 h-fit">
        <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
        <div className="flex items-center justify-between text-sm">
          <span>Subtotal</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="mt-1 text-xs text-zinc-500">Shipping & taxes calculated at checkout.</div>

        <button onClick={() => navigate("/checkout")} className="mt-4 w-full px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700">
          Proceed to Checkout
        </button>

        <Link to="/products" className="mt-2 block text-center text-sm text-amber-700 hover:underline">
          Continue Shopping
        </Link>
      </aside>
    </div>
  );
}
