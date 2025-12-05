import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError("");
        const { data } = await api.get("/admin/stats"); // needs valid admin token
        if (!cancelled) {
          // ensure defaults so UI never crashes
          setStats({
            products: data?.products ?? 0,
            orders: data?.orders ?? 0,
            revenue: data?.revenue ?? 0,
            sevenDay: Array.isArray(data?.sevenDay) ? data.sevenDay : [],
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.message || e?.message || "Failed to load stats");
          // set minimal stats so UI still renders
          setStats({ products: 0, orders: 0, revenue: 0, sevenDay: [] });
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!stats && !error) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="grid gap-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card title="Products" value={stats.products} />
        <Card title="Orders" value={stats.orders} />
        <Card title="Revenue (₹)" value={stats.revenue} />
      </div>

      <div className="p-4 bg-white border rounded">
        <h3 className="font-semibold mb-3">Last 7 days sales</h3>
        <ul className="grid sm:grid-cols-7 gap-2 text-sm">
          {(stats.sevenDay ?? []).map((d) => (
            <li key={d.day} className="p-2 bg-amber-50 rounded border text-center">
              <div className="text-xs text-zinc-500">{String(d.day).slice(5)}</div>
              <div className="font-semibold">₹{d.total ?? 0}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="p-4 bg-white border rounded">
      <div className="text-sm text-zinc-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
