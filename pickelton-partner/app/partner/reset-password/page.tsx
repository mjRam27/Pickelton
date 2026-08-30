"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import "../login/page.css";

const API_BASE = process.env.NEXT_PUBLIC_PARTNER_API_URL || "http://localhost:8090/api/v1";

export default function ResetPasswordPage() {
  const [token, setToken] = useState(""); const [loading, setLoading] = useState(false); const [message, setMessage] = useState<{type:"success"|"error";text:string}|null>(null);
  useEffect(() => { void (async () => { const client=createClient(); const code=new URLSearchParams(window.location.search).get("code"); if(code) await client.auth.exchangeCodeForSession(code); const {data}=await client.auth.getSession(); if(data.session) setToken(data.session.access_token); else setMessage({type:"error",text:"This reset link is invalid or has expired."}); })(); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const password=String(new FormData(event.currentTarget).get("password")||""); if(password.length<8) return setMessage({type:"error",text:"Password must be at least 8 characters."}); setLoading(true); setMessage(null); try { const response=await fetch(`${API_BASE}/auth/reset-password`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({password})}); const result=await response.json().catch(()=>null); if(!response.ok) throw new Error(result?.error?.message||result?.message||"Password could not be updated."); const {error}=await createClient().auth.updateUser({password}); if(error) throw error; setMessage({type:"success",text:"Password updated. You can now sign in."}); } catch(error){setMessage({type:"error",text:error instanceof Error?error.message:"Password could not be updated."});} finally{setLoading(false);} }
  return <main className="partner-login auth-single"><section className="login-card"><div className="login-box"><span className="login-brand">PICKELTON</span><header className="login-header"><h2>Reset Password</h2><p className="login-subtitle">Choose a new password for your partner account.</p></header><form className="login-form" onSubmit={submit}><label className="form-field"><span>NEW PASSWORD</span><div className="input-control"><LockKeyhole size={17}/><input name="password" type="password" minLength={8} autoComplete="new-password" required/></div></label><button className="login-button" disabled={loading||!token}>{loading?"UPDATING…":"UPDATE PASSWORD"}</button></form>{message&&<p className={`auth-message ${message.type}`} role={message.type==="error"?"alert":"status"}>{message.text}</p>}<Link className="auth-link" href="/partner/login">← Back to Login</Link></div></section></main>;
}
