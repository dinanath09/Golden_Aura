import { useState } from "react";
import { api } from "../../lib/api";

export default function Security(){
  const [form,setForm]=useState({oldPassword:"", newPassword:"", cpassword:""});
  const [msg,setMsg]=useState("");
  const onChange=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  const onSubmit=async e=>{
    e.preventDefault(); setMsg("");
    if(form.newPassword!==form.cpassword){ setMsg("Passwords do not match"); return; }
    try{
      await api.post("/users/me/change-password",{oldPassword:form.oldPassword,newPassword:form.newPassword});
      setMsg("Password updated.");
      setForm({oldPassword:"",newPassword:"",cpassword:""});
    }catch(err){ setMsg(err?.response?.data?.message || "Error"); }
  };
  return (
    <form onSubmit={onSubmit} className="grid gap-3 max-w-md">
      <input name="oldPassword" type="password" placeholder="Old password" className="border rounded px-3 py-2" value={form.oldPassword} onChange={onChange}/>
      <input name="newPassword" type="password" placeholder="New password" className="border rounded px-3 py-2" value={form.newPassword} onChange={onChange}/>
      <input name="cpassword" type="password" placeholder="Confirm new password" className="border rounded px-3 py-2" value={form.cpassword} onChange={onChange}/>
      <button className="px-4 py-2 rounded bg-amber-600 text-white">Change Password</button>
      {msg && <div className={`text-sm ${/updated/.test(msg)?'text-green-600':'text-red-600'}`}>{msg}</div>}
    </form>
  );
}
