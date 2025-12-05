// frontend/src/pages/admin/Products.jsx
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

/**
 * Admin · Products
 * - create product (then upload images)
 * - update product (then optionally upload images)
 * - delete product
 * - list products with thumbnail preview
 */

/* Config */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* Helpers */
const buildUrl = (src) => {
  if (!src) return "https://via.placeholder.com/600x600?text=No+Image";
  if (typeof src === "string") return src.startsWith("http") ? src : `${API_BASE}${src}`;
  // object: maybe { url } or { path } or { secure_url }
  if (src.url) return src.url;
  if (src.path) return src.path.startsWith("http") ? src.path : `${API_BASE}${src.path}`;
  if (src.secure_url) return src.secure_url;
  return "https://via.placeholder.com/600x600?text=No+Image";
};

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: "",
    price: "",
    type: "Spray",
    category: "Unisex",
    description: "",
  });
  const [editing, setEditing] = useState(null);
  const [files, setFiles] = useState([]); // File objects selected by user
  const [previews, setPreviews] = useState([]); // Data URLs for preview
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load products failed", e?.response?.data || e);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // create product + upload files (if any)
  const onCreate = async () => {
    if (!form.title || !form.price || !form.type) {
      alert("Title, Price and Type are required");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/products", {
        title: form.title,
        price: Number(form.price),
        type: form.type,
        category: form.category,
        description: form.description,
      });

      const created = data?.product || data;
      const id = created?._id;
      if (!id) throw new Error("Create response missing _id");

      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f));
        await api.post(`/products/${id}/images`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      resetForm();
      await load();
    } catch (e) {
      console.error("Create failed", e?.response?.data || e);
      alert(e?.response?.data?.message || e.message || "Create failed");
    } finally {
      setBusy(false);
    }
  };

  // update product + optionally upload files
  const onUpdate = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      await api.put(`/products/${editing}`, {
        title: form.title,
        price: Number(form.price),
        type: form.type,
        category: form.category,
        description: form.description,
      });

      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f));
        await api.post(`/products/${editing}/images`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setEditing(null);
      resetForm();
      await load();
    } catch (e) {
      console.error("Update failed", e?.response?.data || e);
      alert(e?.response?.data?.message || e.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const onEdit = (p) => {
    setEditing(p._id);
    setForm({
      title: p.title || "",
      price: p.price ?? "",
      type: p.type || "Spray",
      category: p.category || "Unisex",
      description: p.description || "",
    });
    setFiles([]);
    setPreviews([]);
  };

  const onDelete = async (id) => {
    if (!confirm("Delete product?")) return;
    try {
      await api.delete(`/products/${id}`);
      if (editing === id) {
        setEditing(null);
        resetForm();
      }
      await load();
    } catch (e) {
      console.error("Delete failed", e?.response?.data || e);
      alert(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  function resetForm() {
    setForm({ title: "", price: "", type: "Spray", category: "Unisex", description: "" });
    setFiles([]);
    setPreviews([]);
  }

  // file input change: store files and create previews
  const onFilesChange = (ev) => {
    const farr = Array.from(ev.target.files || []);
    setFiles(farr);

    // create previews
    const readers = farr.map((f) => {
      return new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.readAsDataURL(f);
      });
    });

    Promise.all(readers).then((imgs) => setPreviews(imgs));
  };

  if (loading) {
    return <div className="py-16 text-center">Loading products...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Admin · Products</h1>

      {/* Form */}
      <div className="grid gap-3 max-w-xl">
        <input
          className="border rounded px-3 py-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
        />

        <label className="text-sm font-medium">Product Type</label>
        <select
          className="border rounded px-3 py-2"
          value={form.type}
          onChange={(e) => setField("type", e.target.value)}
        >
          <option value="Attar">Attar</option>
          <option value="Spray">Spray</option>
          <option value="Solid Perfume">Solid Perfume</option>
          <option value="Perfume Candle">Perfume Candle</option>
        </select>

        <input
          className="border rounded px-3 py-2"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setField("price", e.target.value)}
        />

        <input
          className="border rounded px-3 py-2"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setField("category", e.target.value)}
        />

        <textarea
          className="border rounded px-3 py-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
        />

        <label className="text-sm font-medium">Images (multiple)</label>
        <input type="file" multiple onChange={onFilesChange} />

        {/* previews */}
        {previews.length > 0 && (
          <div className="flex gap-2 mt-2">
            {previews.map((src, i) => (
              <img key={i} src={src} alt={`preview-${i}`} className="w-20 h-20 object-cover rounded border" />
            ))}
          </div>
        )}

        <div className="flex gap-3">
          {!editing ? (
            <button
              disabled={busy}
              onClick={onCreate}
              className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
              {busy ? "Saving..." : "Create"}
            </button>
          ) : (
            <button
              disabled={busy}
              onClick={onUpdate}
              className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
              {busy ? "Updating..." : "Update"}
            </button>
          )}

          {editing && (
            <button
              onClick={() => {
                setEditing(null);
                resetForm();
              }}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {items.map((p) => {
          const thumb = buildThumbnail(p);
          return (
            <div key={p._id} className="border rounded p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src={thumb} alt={p.title} className="w-20 h-20 object-cover rounded" />
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-gray-600">
                    ₹{p.price} · {p.type} · {p.category}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => onEdit(p)} className="px-2 py-1 border rounded">
                  Edit
                </button>
                <button onClick={() => onDelete(p._id)} className="px-2 py-1 border rounded">
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Helper to pick a thumbnail safely (string or object)
  function buildThumbnail(product) {
    const first = product.images?.[0];
    // If images stored as array of strings: "/images/abc.jpg"
    // If stored as array of objects: [{ url: 'https://...' }, ...]
    return buildUrl(first);
  }
}
