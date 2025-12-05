import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function StoreSettings(){
  const [form, setForm] = useState({ name:"", tagline:"", phone:"", email:"", address:"" });

  useEffect(() => {
    api.get("/store").then(r => {
      const { name, tagline, phone, email, address } = r.data || {};
      setForm({ name: name||"", tagline: tagline||"", phone: phone||"", email: email||"", address: address||"" });
    });
  }, []);

  async function onSave(e){
    e.preventDefault();
    const { data } = await api.put("/store", form);
    setForm(prev => ({ ...prev, ...data }));
    alert("Saved!");
  }

  function f(k, v){ setForm(s => ({ ...s, [k]: v })); }

  return (
    <form onSubmit={onSave} className="max-w-xl grid gap-3">
      <h2 className="text-xl font-semibold mb-2">Store Settings</h2>
      {["name","tagline","phone","email","address"].map(k=>(
        <input key={k} className="border border-zinc-300 rounded-lg px-3 py-2"
               placeholder={k[0].toUpperCase()+k.slice(1)} value={form[k]} onChange={e=>f(k,e.target.value)} />
      ))}
      <button className="mt-2 px-4 py-2 rounded-lg bg-amber-600 text-white">Save</button>
    </form>
  );
}
