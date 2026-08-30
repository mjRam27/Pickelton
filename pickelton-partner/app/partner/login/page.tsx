"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import "./page.css";

const loginTheme = {
  "--lime": "#b8ff2c",
  "--bg": "#050505",
  "--text": "#ffffff",
} as CSSProperties;

const heroBackground = {
  backgroundImage: `
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.53) 0%,
      rgba(0, 0, 0, 0.28) 53%,
      rgba(0, 0, 0, 0.42) 100%
    ),
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.14) 0%,
      rgba(0, 0, 0, 0.04) 58%,
      rgba(0, 0, 0, 0.28) 100%
    ),
    url("/images/partner-hero.png")
  `,
} as CSSProperties;

export default function PartnerLoginPage() {
  const router = useRouter();
  const [oauthError, setOauthError] = useState("");
  const [oauthLoading, setOauthLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState("");
  const [verificationState, setVerificationState] = useState<"success" | "expired" | "unconfirmed" | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("verification");
    if (state === "success" || state === "expired") setVerificationState(state);
    const errorCode = params.get("error_code") || params.get("error");
    const description = params.get("error_description") || "";
    if (errorCode === "otp_expired" || errorCode === "access_denied" || /expired|invalid|already/i.test(description)) {
      setVerificationState("expired");
      window.history.replaceState(null, "", "/partner/login?verification=expired");
    }
  }, []);

  const handleResendVerification = async () => {
    const normalizedEmail = email.trim();
    setResendMessage(null);
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setResendMessage({ type: "error", text: "Enter a valid email address above." });
      return;
    }
    if (resendLoading) return;
    setResendLoading(true);
    try {
      const { error } = await createClient().auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: { emailRedirectTo: `${window.location.origin}/partner/auth/confirm` },
      });
      if (error) throw error;
      setResendMessage({ type: "success", text: "Verification email sent. Please check your inbox." });
    } catch (error) {
      setResendMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to resend the verification email." });
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthError("");
    setOauthLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/partner/auth/callback` },
      });
      if (error) throw error;
    } catch (error) {
      setOauthError(error instanceof Error ? error.message : "Unable to start Google sign-in.");
      setOauthLoading(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loginLoading) return;
    setLoginLoading(true);
    setLoginError("");
    setResendMessage(null);

    const formData = new FormData(event.currentTarget);

    const password = formData.get("password") as string;

    try {
      const response = await fetch(
        "http://localhost:8090/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const result = await response.json().catch(() => null);

      console.info("Partner login response", {
        status: response.status,
        ok: response.ok,
        hasData: Boolean(result?.data),
        hasToken: typeof result?.data?.token === "string",
        message: result?.error?.message || result?.message,
      });

      let token = result?.data?.token;

      if (!response.ok || typeof token !== "string") {
        const supabase = createClient();
        const { data, error: supabaseError } = await supabase.auth.signInWithPassword({ email, password });
        if (supabaseError || !data.session) {
          throw new Error(supabaseError?.message || result?.error?.message || result?.message || "Invalid email or password.");
        }
        const exchangeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_PARTNER_API_URL || "http://localhost:8090/api/v1"}/auth/supabase/exchange`,
          { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}` } },
        );
        const exchange = await exchangeResponse.json().catch(() => null);
        if (!exchangeResponse.ok || typeof exchange?.data?.token !== "string") {
          throw new Error(exchange?.error?.message || exchange?.message || "Partner session could not be created.");
        }
        token = exchange.data.token;
      }

      if (!token || typeof token !== "string") {
        throw new Error("Login response did not include a partner token.");
      }

      localStorage.setItem("partner_token", token);

      console.info("Partner token stored", {
        stored: localStorage.getItem("partner_token") !== null,
      });

      router.push("/partner/dashboard");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to sign in. Please try again.";
      if (/email not confirmed/i.test(text)) {
        setVerificationState("unconfirmed");
        setLoginError("Email not confirmed. Verify your email before signing in.");
      } else {
        console.error("Partner login failed", error);
        setLoginError(text);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <main className="partner-login" style={loginTheme}>
      <section className="hero" style={heroBackground}>
        <div className="hero-content">
          <div className="hero-top">
            <div className="brand">
              <span>PICKELTON</span>

              <p className="brand-tagline">
                PLAY. COMPETE. CONNECT.
              </p>
            </div>

            <h1>
              Where Great
              <br />
              Clubs <span>Play.</span>
            </h1>

            <p className="hero-description">
              Manage courts, bookings, players and club operations from
              one powerful platform.
            </p>
          </div>

          <div className="hero-features">
            <article className="feature">
              <span aria-hidden="true">🏟️</span>

              <div>
                <h3>Court Management</h3>
                <p>Manage courts and availability.</p>
              </div>
            </article>

            <article className="feature">
              <span aria-hidden="true">📅</span>

              <div>
                <h3>Booking Management</h3>
                <p>Track reservations and players.</p>
              </div>
            </article>

            <article className="feature">
              <span aria-hidden="true">📊</span>

              <div>
                <h3>Revenue Analytics</h3>
                <p>Monitor business performance.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="login-card">
        <div className="login-box">
          <span className="login-brand">PICKELTON</span>

          <header className="login-header">
            <h2>WELCOME BACK</h2>

            <p className="login-subtitle">
              Enter your credentials to manage your courts, bookings and
              revenue.
            </p>
          </header>

          <form className="login-form" onSubmit={handleLogin}>
            <label className="form-field" htmlFor="email">
              <span>EMAIL ADDRESS</span>

              <div className="input-control">
                <Mail size={17} aria-hidden="true" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="form-field" htmlFor="password">
              <span>PASSWORD</span>

              <div className="input-control">
                <LockKeyhole size={17} aria-hidden="true" />

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            <div className="login-options">
              <label htmlFor="remember-partner">
                <input
                  id="remember-partner"
                  name="remember"
                  type="checkbox"
                />
                <span>Remember me</span>
              </label>

              <Link href="/partner/forgot-password">Forgot Password?</Link>
            </div>

            <button className="login-button" type="submit" disabled={loginLoading}>
              <span>{loginLoading ? "SIGNING IN…" : "SIGN IN"}</span>
              <Zap size={17} aria-hidden="true" />
            </button>
          </form>
          {loginError && <p className="login-action-message" role="alert">{loginError}</p>}
          {verificationState === "success" && <p className="auth-message success" role="status">Email verified successfully. You can now sign in.</p>}
          {(verificationState === "expired" || verificationState === "unconfirmed") && <div className="verification-panel"><p className="auth-message error" role="status">{verificationState === "expired" ? "Your verification link has expired or has already been used. Please request a new verification email." : "Email not verified?"}</p><button className="resend-verification" type="button" onClick={handleResendVerification} disabled={resendLoading}>{resendLoading ? "Sending verification email…" : "Resend verification email"}</button></div>}
          {resendMessage && <p className={`auth-message ${resendMessage.type}`} role={resendMessage.type === "error" ? "alert" : "status"}>{resendMessage.text}</p>}

          <p className="login-footer create-account-link">
            New to Pickelton? <Link href="/partner/register">Create Account</Link>
          </p>

          <div className="login-divider">
            <span>OR CONNECT</span>
          </div>

          <button className="google-button" type="button" onClick={handleGoogleLogin} disabled={oauthLoading}>
            {oauthLoading ? "Connecting to Google…" : "Continue with Google"}
          </button>
          {oauthError && <p className="login-action-message" role="alert">{oauthError}</p>}

          <p className="login-footer">
            Need help? <Link href="/partner/support">Contact Support</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
