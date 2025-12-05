// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { api } from "../lib/api";

export default function ForgotPassword(){
  const [email,setEmail]=useState(""); const [msg,setMsg]=useState("");
  const submit=async e=>{ e.preventDefault(); setMsg(""); await api.post("/users/forgot-password",{email}); setMsg("If your email exists, reset link sent."); };
  return (
    <form onSubmit={submit} className="max-w-md mx-auto grid gap-3">
      <h1 className="text-xl font-bold">Forgot Password</h1>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="border rounded px-3 py-2"/>
      <button className="px-4 py-2 rounded bg-amber-600 text-white">Send reset link</button>
      {msg && <div className="text-green-600 text-sm">{msg}</div>}
    </form>
  );
}
