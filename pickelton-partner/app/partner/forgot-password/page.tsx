"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import "../login/page.css";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(null);
    const email = String(new FormData(event.currentTarget).get("email") || "").trim();
    if (!email) return setMessage({ type: "error", text: "Enter your email address." });
    setLoading(true);
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/partner/reset-password`,
      });
      if (error) throw error;
      setMessage({ type: "success", text: "Reset link sent. Check your email for the next step." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to send the reset link." });
    } finally { setLoading(false); }
  }

  return <main className="partner-login auth-single"><section className="login-card"><div className="login-box">
    <span className="login-brand">PICKELTON</span>
    <header className="login-header"><h2>Forgot Password?</h2><p className="login-subtitle">Enter your partner email and we’ll send a secure password-reset link.</p></header>
    <form className="login-form" onSubmit={submit}><label className="form-field" htmlFor="email"><span>EMAIL ADDRESS</span><div className="input-control"><Mail size={17} aria-hidden="true"/><input id="email" name="email" type="email" autoComplete="email" placeholder="Email address" required/></div></label><button className="login-button" disabled={loading}>{loading ? "SENDING…" : "SEND RESET LINK"}</button></form>
    {message && <p className={`auth-message ${message.type}`} role={message.type === "error" ? "alert" : "status"}>{message.text}</p>}
    <Link className="auth-link" href="/partner/login">← Back to Login</Link>
  </div></section></main>;
}
