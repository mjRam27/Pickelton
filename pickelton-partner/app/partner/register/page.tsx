"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import "../login/page.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PartnerRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [fields, setFields] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setMessage(null);

    const fullName = fields.fullName.trim();
    const email = fields.email.trim();
    const { password, confirmPassword } = fields;

    if (!fullName || !email || !password || !confirmPassword) {
      return setMessage({ type: "error", text: "Complete all required fields." });
    }
    if (!emailPattern.test(email)) {
      return setMessage({ type: "error", text: "Enter a valid email address." });
    }
    if (password.length < 8) {
      return setMessage({ type: "error", text: "Password must be at least 8 characters." });
    }
    if (password !== confirmPassword) {
      return setMessage({ type: "error", text: "Password and Confirm Password must match." });
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/partner/auth/confirm`,
        },
      });
      if (error) throw error;
      setFields({ fullName: "", email: "", password: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Account created successfully. Please check your email to verify your account before signing in." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to create your account. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="partner-login auth-single">
      <section className="login-card">
        <div className="login-box">
          <span className="login-brand">PICKELTON</span>
          <header className="login-header">
            <h2>CREATE ACCOUNT</h2>
            <p className="login-subtitle">Create your Pickelton Partner account to manage your club.</p>
          </header>
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="form-field" htmlFor="fullName"><span>FULL NAME</span><div className="input-control"><UserRound size={17} aria-hidden="true"/><input id="fullName" name="fullName" type="text" autoComplete="name" placeholder="Full name" value={fields.fullName} onChange={(event) => setFields((current) => ({ ...current, fullName: event.target.value }))} required/></div></label>
            <label className="form-field" htmlFor="registerEmail"><span>EMAIL ADDRESS</span><div className="input-control"><Mail size={17} aria-hidden="true"/><input id="registerEmail" name="email" type="email" autoComplete="email" placeholder="Email address" value={fields.email} onChange={(event) => setFields((current) => ({ ...current, email: event.target.value }))} required/></div></label>
            <label className="form-field" htmlFor="registerPassword"><span>PASSWORD</span><div className="input-control"><LockKeyhole size={17} aria-hidden="true"/><input id="registerPassword" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength={8} value={fields.password} onChange={(event) => setFields((current) => ({ ...current, password: event.target.value }))} required/></div></label>
            <label className="form-field" htmlFor="confirmPassword"><span>CONFIRM PASSWORD</span><div className="input-control"><LockKeyhole size={17} aria-hidden="true"/><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat password" minLength={8} value={fields.confirmPassword} onChange={(event) => setFields((current) => ({ ...current, confirmPassword: event.target.value }))} required/></div></label>
            <button className="login-button" type="submit" disabled={loading}>{loading ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}</button>
          </form>
          {message && <p className={`auth-message ${message.type}`} role={message.type === "error" ? "alert" : "status"}>{message.text}</p>}
          <Link className="auth-link" href="/partner/login">← Back to Sign In</Link>
        </div>
      </section>
    </main>
  );
}
