import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function Addresses(){
  const [items,setItems]=useState([]);
  const [form,setForm]=useState({label:"Home", fullName:"", phone:"", line1:"", line2:"",city:"",state:"",zip:"",country:"India", isDefault:false});
  const [editing,setEditing]=useState(null);

  const load=()=> api.get("/users/me/addresses").then(({data})=>setItems(data));
  useEffect(()=>{ load(); },[]);

  const onChange=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  const onToggle=e=>setForm(f=>({...f,[e.target.name]:e.target.checked}));

  const submit=async e=>{
    e.preventDefault();
    if(editing){
      await api.put(`/users/me/addresses/${editing}`, form);
      setEditing(null);
    }else{
      await api.post("/users/me/addresses", form);
    }
    setForm({label:"Home", fullName:"", phone:"", line1:"", line2:"",city:"",state:"",zip:"",country:"India", isDefault:false});
    load();
  };

  const edit=(a)=>{ setEditing(a._id); setForm(a); };
  const del=async(id)=>{ await api.delete(`/users/me/addresses/${id}`); load(); };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={submit} className="grid gap-2">
        <div className="font-semibold">{editing? "Edit Address":"Add New Address"}</div>
        <input name="label" placeholder="Label (Home/Work)" value={form.label} onChange={onChange} className="border rounded px-3 py-2"/>
        <input name="fullName" placeholder="Full name" value={form.fullName} onChange={onChange} className="border rounded px-3 py-2"/>
        <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} className="border rounded px-3 py-2"/>
        <input name="line1" placeholder="Address line 1" value={form.line1} onChange={onChange} className="border rounded px-3 py-2"/>
        <input name="line2" placeholder="Address line 2" value={form.line2} onChange={onChange} className="border rounded px-3 py-2"/>
        <div className="grid grid-cols-3 gap-2">
          <input name="city" placeholder="City" value={form.city} onChange={onChange} className="border rounded px-3 py-2"/>
          <input name="state" placeholder="State" value={form.state} onChange={onChange} className="border rounded px-3 py-2"/>
          <input name="zip" placeholder="PIN" value={form.zip} onChange={onChange} className="border rounded px-3 py-2"/>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={onToggle}/> Make default
        </label>
        <button className="px-4 py-2 rounded bg-amber-600 text-white">{editing?"Save":"Add"}</button>
      </form>

      <div className="space-y-3">
        {items.map(a=>(
          <div key={a._id} className="rounded border p-3 flex items-start justify-between">
            <div>
              <div className="font-medium">{a.label} {a.isDefault && <span className="text-xs text-amber-600">(Default)</span>}</div>
              <div className="text-sm text-zinc-700">{a.fullName} • {a.phone}</div>
              <div className="text-sm text-zinc-600">{a.line1}{a.line2?`, ${a.line2}`:''}, {a.city}, {a.state} {a.zip}</div>
            </div>
            <div className="flex gap-2">
              <button className="text-amber-700 underline text-sm" onClick={()=>edit(a)}>Edit</button>
              <button className="text-red-600 underline text-sm" onClick={()=>del(a._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
