// src/pages/ResetPassword.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../lib/api";

export default function ResetPassword(){
  const { token } = useParams(); const nav=useNavigate();
  const [p,setP]=useState(""); const [c,setC]=useState(""); const [msg,setMsg]=useState("");
  const submit=async e=>{ e.preventDefault(); setMsg(""); if(p!==c){setMsg("Passwords do not match");return;}
    try{ await api.post(`/users/reset-password/${token}`,{password:p}); setMsg("Password updated. Redirecting…"); setTimeout(()=>nav("/login"),800);}
    catch(err){ setMsg(err?.response?.data?.message||"Error"); }
  };
  return (
    <form onSubmit={submit} className="max-w-md mx-auto grid gap-3">
      <h1 className="text-xl font-bold">Reset Password</h1>
      <input type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="New password" className="border rounded px-3 py-2"/>
      <input type="password" value={c} onChange={e=>setC(e.target.value)} placeholder="Confirm password" className="border rounded px-3 py-2"/>
      <button className="px-4 py-2 rounded bg-amber-600 text-white">Reset</button>
      {msg && <div className={`text-sm ${/updated/.test(msg)?'text-green-600':'text-red-600'}`}>{msg}</div>}
    </form>
  );
}
