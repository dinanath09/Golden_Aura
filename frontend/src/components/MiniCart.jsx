import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function MiniCart({ onClose }) {
  const { items, subtotal, remove } = useCart();

  return (
    <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-white shadow-xl p-3 z-50">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">My Cart</div>
        <button onClick={onClose} className="text-sm text-zinc-600 hover:text-black">Close</button>
      </div>

      {!items.length ? (
        <div className="text-sm text-zinc-600 py-6 text-center">Your cart is empty.</div>
      ) : (
        <>
          <ul className="max-h-64 overflow-auto divide-y">
            {items.map((it) => (
              <li key={it._id} className="py-2 flex gap-3 items-center">
                <img
                  src={it.image || "/placeholder.png"}
                  alt={it.title}
                  className="h-12 w-12 rounded object-cover border"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium line-clamp-1">{it.title}</div>
                  <div className="text-xs text-zinc-600">Qty: {it.qty}</div>
                </div>
                <div className="text-sm font-semibold">₹{(it.price * it.qty).toFixed(2)}</div>
                <button
                  onClick={() => remove(it._id)}
                  className="ml-2 text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-zinc-600">Subtotal</div>
            <div className="text-base font-semibold">₹{subtotal.toFixed(2)}</div>
          </div>

          <Link
            to="/cart"
            onClick={onClose}
            className="mt-3 block w-full text-center px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
          >
            View Cart & Checkout
          </Link>
        </>
      )}
    </div>
  );
}
