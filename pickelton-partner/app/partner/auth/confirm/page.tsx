"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import "../../login/page.css";

const expiredCodes = new Set(["otp_expired", "access_denied"]);

export default function PartnerEmailConfirmationPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const errorCode = params.get("error_code") || params.get("error");
      const errorDescription = params.get("error_description") || "";

      if (errorCode && (expiredCodes.has(errorCode) || /expired|invalid|already/i.test(errorDescription))) {
        router.replace("/partner/login?verification=expired");
        return;
      }

      try {
        const supabase = createClient();
        const code = params.get("code");
        const tokenHash = params.get("token_hash");
        const type = params.get("type") as EmailOtpType | null;

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (tokenHash && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (verifyError) throw verifyError;
        } else {
          const { data } = await supabase.auth.getSession();
          if (!data.session) throw new Error("The verification link is invalid or incomplete.");
        }

        await supabase.auth.signOut();
        router.replace("/partner/login?verification=success");
      } catch (caught) {
        const text = caught instanceof Error ? caught.message : "Email verification failed.";
        if (/expired|invalid|already|otp/i.test(text)) {
          router.replace("/partner/login?verification=expired");
          return;
        }
        setError(text);
      }
    })();
  }, [router]);

  return <main className="partner-login auth-single"><section className="login-card"><div className="login-box"><span className="login-brand">PICKELTON</span><header className="login-header"><h2>{error ? "Verification Failed" : "Verifying Email"}</h2><p className="login-subtitle">{error || "Confirming your email address…"}</p></header>{error && <Link className="auth-link" href="/partner/login?verification=expired">← Back to Sign In</Link>}</div></section></main>;
}
