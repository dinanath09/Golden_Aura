// src/pages/Wishlist.jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const [items, setItems] = useState([]);

  const load = () => api.get("/wishlist").then((r) => setItems(r.data));
  useEffect(() => {
    load();
  }, []);

  async function removeItem(id) {
    await api.delete(`/wishlist/${id}`);
    load();
  }

  if (!items.length) return <p>No items in wishlist.</p>;

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-semibold">My Wishlist</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((p) => (
          <div key={p._id} className="border rounded-xl p-3 bg-white">
            {p.images?.[0]?.url && (
              <img
                src={p.images[0].url}
                alt={p.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}

            <div className="font-semibold">{p.title}</div>
            <div className="text-sm text-zinc-500">{p.category}</div>
            <div className="font-bold mt-1">₹{p.price}</div>

            <div className="mt-2 flex gap-2">
              <Link
                to={`/products/${p.slug}`}
                className="px-3 py-1 rounded border"
              >
                View
              </Link>
              <button
                onClick={() => removeItem(p._id)}
                className="px-3 py-1 rounded border"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
