"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "../../login/page.css";

const API_BASE = process.env.NEXT_PUBLIC_PARTNER_API_URL || "http://localhost:8090/api/v1";

export default function AuthCallbackPage() {
  const router = useRouter(); const [error, setError] = useState("");
  useEffect(() => { void (async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get("error_description"); if (oauthError) throw new Error(oauthError);
      const code = params.get("code"); if (!code) throw new Error("Google did not return an authorization code.");
      const { data, error: sessionError } = await createClient().auth.exchangeCodeForSession(code);
      if (sessionError || !data.session) throw sessionError || new Error("Google session could not be created.");
      const response = await fetch(`${API_BASE}/auth/oauth/exchange`, { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}` } });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.data?.token) throw new Error(result?.error?.message || result?.message || "Partner sign-in could not be completed.");
      localStorage.setItem("partner_token", result.data.token); router.replace("/partner/dashboard");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Google sign-in failed."); }
  })(); }, [router]);
  return <main className="partner-login auth-single"><section className="login-card"><div className="login-box"><span className="login-brand">PICKELTON</span><header className="login-header"><h2>{error ? "Sign-in Failed" : "Signing You In"}</h2><p className="login-subtitle">{error || "Completing secure Google authentication…"}</p></header>{error && <Link className="auth-link" href="/partner/login">← Back to Login</Link>}</div></section></main>;
}
