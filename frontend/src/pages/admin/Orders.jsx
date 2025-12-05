import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function Orders(){
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");

  const load = () => api.get(`/orders${filter?`?status=${filter}`:''}`).then(r=>setItems(r.data));
  useEffect(()=>{ load(); },[filter]);

  async function updateStatus(id, status){
    await api.put(`/orders/${id}/status`, { status });
    load();
  }
  async function remove(id){ await api.delete(`/orders/${id}`); load(); }

  return (
    <div className="grid gap-4">
      <div className="flex gap-2 items-center">
        <select className="border rounded px-2 py-1" value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="">All</option>
          {['pending','processing','shipped','delivered','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid gap-3">
        {items.map(o=>(
          <div key={o._id} className="border rounded p-3 bg-white">
            <div className="flex justify-between">
              <div className="font-semibold">Order #{o._id.slice(-6)}</div>
              <div className="text-sm text-zinc-500">{new Date(o.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-sm">Items: {o.items.map(i=>`${i.title}×${i.qty}`).join(', ')}</div>
            <div className="mt-1 font-bold">Total: ₹{o.total}</div>
            <div className="mt-2 flex gap-2">
              <select className="border rounded px-2 py-1" value={o.status} onChange={e=>updateStatus(o._id, e.target.value)}>
                {['pending','processing','shipped','delivered','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={()=>remove(o._id)} className="px-3 py-1 rounded border">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
