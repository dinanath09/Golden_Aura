import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { setUser } = useAuth(); // ensure setUser is exposed by your AuthContext
  const [form, setForm] = useState({ name: "", email: "", mobile: "", avatarUrl: "" });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/users/me");
        if (!alive) return;
        const u = data?.user || data || {};
        setForm({
          name: u.name || "",
          email: u.email || "",
          mobile: u.mobile || "",
          avatarUrl: u.avatarUrl || ""
        });
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || "Failed to load profile");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      const { data } = await api.put("/users/me", form);
      const updated = data?.user || data;
      setUser?.(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setMsg("Saved!");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to save profile");
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}
      {msg && <div className="mb-3 text-green-600 text-sm">{msg}</div>}

      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="flex items-center gap-3">
          <img
            src={form.avatarUrl || "https://i.pravatar.cc/100"}
            onError={(e) => (e.currentTarget.src = "https://i.pravatar.cc/100")}
            alt="avatar"
            className="h-12 w-12 rounded-full border"
          />
          <input
            name="avatarUrl"
            placeholder="Avatar URL"
            value={form.avatarUrl}
            onChange={onChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={onChange}
          className="border rounded px-3 py-2"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          className="border rounded px-3 py-2"
        />

        <input
          name="mobile"
          placeholder="Mobile"
          value={form.mobile}
          onChange={onChange}
          className="border rounded px-3 py-2"
        />

        <button className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700">
          Save
        </button>
      </form>
    </div>
  );
}
