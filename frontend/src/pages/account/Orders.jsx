// src/pages/account/Orders.jsx
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function Orders(){
  const [items,setItems]=useState([]);
  useEffect(()=>{ api.get("/orders/mine").then(({data})=>setItems(data||[])); },[]);
  if(!items.length) return <div>No orders yet.</div>;
  return (
    <div className="space-y-3">
      {items.map(o=>(
        <div key={o._id} className="rounded border p-3">
          <div className="font-medium">Order #{o._id.slice(-6)} — {o.status}</div>
          <div className="text-sm text-zinc-600">{new Date(o.createdAt).toLocaleString()}</div>
          <div className="mt-2 text-sm">
            {o.items?.map(it=><div key={it._id}>{it.title} × {it.qty}</div>)}
          </div>
        </div>
      ))}
    </div>
  );
}
