// src/components/AdminImageUploader.jsx
import { useState } from "react";
import { api } from "../lib/api";

export default function AdminImageUploader({ product, onChanged }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  const hasImages = (product.images || []).length > 0;

  async function upload() {
    if (!files.length) return;
    const fd = new FormData();
    files.forEach(f => fd.append("images", f));
    setBusy(true);
    try {
      await api.post(`/products/${product._id}/images`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFiles([]);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  async function remove(public_id) {
    setBusy(true);
    try {
      await api.delete(`/products/${product._id}/images`, { data: { public_id } });
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 border rounded-lg p-3 bg-zinc-50">
      {/* Thumbnails */}
      {hasImages && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {product.images.map(img => (
            <div key={img.public_id} className="relative group">
              <img
                src={img.url}
                alt=""
                className="w-full h-20 object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => remove(img.public_id)}
                className="absolute top-1 right-1 text-[11px] px-2 py-0.5 rounded bg-white shadow hidden group-hover:block"
                title="Delete"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone + controls */}
      <div className="flex items-center gap-2">
        <label className="flex-1">
          <div className="h-10 rounded-md border-2 border-dashed border-zinc-300 bg-white flex items-center justify-center text-sm text-zinc-500 hover:border-amber-500 cursor-pointer">
            {files.length ? `${files.length} file(s) selected` : "Click to choose images"}
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
        </label>

        <button
          type="button"
          onClick={upload}
          disabled={busy || files.length === 0}
          className="px-3 py-2 rounded-md bg-amber-600 text-white text-sm disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Upload"}
        </button>
      </div>
    </div>
  );
}
