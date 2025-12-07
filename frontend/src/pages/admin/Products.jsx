// frontend/src/pages/admin/Products.jsx
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EMPTY_FORM = {
  title: "",
  price: "",
  type: "Spray",
  category: "Unisex",
  description: "",
  stock: "",
  brandName: "",
  brandCountry: "India",
  brandDescription: "",
};

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/products");
      const list =
        Array.isArray(data?.products) || Array.isArray(data)
          ? data.products || data
          : [];
      setItems(list);
    } catch (e) {
      console.error("Load products failed", e?.response?.data || e);
      setError("Failed to load products");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFiles([]);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        price: Number(form.price) || 0,
        type: form.type,
        category: form.category,
        description: form.description,
        stock: Number(form.stock) || 0,
        brand: {
          name: form.brandName,
          country: form.brandCountry || "India",
          description: form.brandDescription || "",
        },
      };

      let productId;
      let savedProduct;

      if (editingId) {
        const { data } = await api.put(`/products/${editingId}`, payload);
        savedProduct = data?.product || data;
        productId = savedProduct?._id;
      } else {
        const { data } = await api.post("/products", payload);
        savedProduct = data?.product || data;
        productId = savedProduct?._id;
      }

      if (!productId) throw new Error("Save response missing _id");

      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f));
        await api.post(`/products/${productId}/images`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      resetForm();
      await load();
    } catch (e) {
      console.error("Save product failed", e?.response?.data || e);
      setError(
        e?.response?.data?.message || e.message || "Could not save product"
      );
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (p) => {
    setEditingId(p._id);
    setForm({
      title: p.title || "",
      price: p.price ?? "",
      type: p.type || "Spray",
      category: p.category || "Unisex",
      description: p.description || "",
      stock: p.stock ?? "",
      brandName: p.brand?.name || "",
      brandCountry: p.brand?.country || "India",
      brandDescription: p.brand?.description || "",
    });
    setFiles([]);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setSaving(true);
    setError("");
    try {
      await api.delete(`/products/${id}`);
      setItems((prev) => prev.filter((p) => p._id !== id));
      if (editingId === id) resetForm();
    } catch (e) {
      console.error("Delete failed", e?.response?.data || e);
      setError(
        e?.response?.data?.message || e.message || "Could not delete product"
      );
    } finally {
      setSaving(false);
    }
  };

  const buildImgUrl = (raw) => {
    if (!raw) return "/no-image.jpg";
    let src = raw;
    if (Array.isArray(raw)) src = raw[0];
    if (typeof src === "object" && src !== null) {
      src = src.url || src.path || src.secure_url || src.location || null;
    }
    if (!src) return "/no-image.jpg";
    if (
      typeof src === "string" &&
      (src.startsWith("http://") || src.startsWith("https://"))
    ) {
      return src;
    }
    return `${API_BASE}${src.startsWith("/") ? src : `/${src}`}`;
  };

  if (loading) {
    return <div className="p-6">Loading products…</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold mb-2">Admin · Products</h1>
      {error && (
        <div className="p-3 rounded border border-red-300 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 max-w-xl border rounded-2xl p-4 bg-white"
      >
        <h2 className="font-semibold text-lg">
          {editingId ? "Edit product" : "Create product"}
        </h2>

        <input
          className="border rounded px-3 py-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Price (₹)</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Stock</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={form.stock}
              onChange={(e) => setField("stock", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Type</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.type}
              onChange={(e) => setField("type", e.target.value)}
            >
              <option>Attar</option>
              <option>Spray</option>
              <option>Solid Perfume</option>
              <option>Perfume Candle</option>
            </select>
          </div>

          {/* ✅ Category dropdown: Unisex / Male / Female */}
          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
            >
              <option value="Unisex">Unisex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <textarea
          className="border rounded px-3 py-2 min-h-[80px]"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
        />

        <hr className="my-2" />

        <h3 className="font-medium text-sm">Brand details (for invoice)</h3>

        <input
          className="border rounded px-3 py-2"
          placeholder="Brand name"
          value={form.brandName}
          onChange={(e) => setField("brandName", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Brand country</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.brandCountry}
              onChange={(e) => setField("brandCountry", e.target.value)}
            />
          </div>
        </div>

        <textarea
          className="border rounded px-3 py-2 min-h-[60px]"
          placeholder="Brand description"
          value={form.brandDescription}
          onChange={(e) => setField("brandDescription", e.target.value)}
        />

        <div>
          <label className="text-sm font-medium">Images</label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="block mt-1"
          />
          {files.length > 0 && (
            <p className="text-xs text-zinc-500 mt-1">
              {files.length} file(s) selected
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            {saving
              ? editingId
                ? "Updating..."
                : "Saving..."
              : editingId
              ? "Update"
              : "Create"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="border rounded-2xl bg-white">
        <div className="px-4 py-2 border-b font-semibold flex justify-between">
          <span>Products ({items.length})</span>
        </div>
        <div className="divide-y">
          {items.map((p) => (
            <div
              key={p._id}
              className="flex items-center gap-4 px-4 py-3 text-sm"
            >
              <img
                src={buildImgUrl(p.images)}
                alt={p.title}
                className="w-16 h-16 object-cover rounded border"
              />
              <div className="flex-1">
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-zinc-500">
                  {p.type} · {p.category} · ₹{p.price}
                </div>
                {p.brand?.name && (
                  <div className="text-xs text-zinc-600">
                    Brand: {p.brand.name}{" "}
                    {p.brand.country ? `(${p.brand.country})` : ""}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(p)}
                  className="px-3 py-1 border rounded text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(p._id)}
                  className="px-3 py-1 border rounded text-xs text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!items.length && (
            <div className="px-4 py-6 text-sm text-zinc-500">
              No products yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
