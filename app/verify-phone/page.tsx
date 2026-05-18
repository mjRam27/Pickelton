"use client";

import Link from "next/link";
import { CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { getApiMessage } from "@/services/api";
import { getMe, getStoredUser, requestPhoneOtp, verifyPhoneOtp } from "@/services/auth";

export default function VerifyPhonePage() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored?.phoneNumber) setPhone(stored.phoneNumber);
    getMe()
      .then((response) => setPhone(response.data?.phoneNumber ?? stored?.phoneNumber ?? ""))
      .catch(() => undefined);
  }, []);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!code.trim()) {
      setError("OTP code is required.");
      return;
    }
    if (code.trim().length < 4 || code.trim().length > 8) {
      setError("Code should be 4 to 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await verifyPhoneOtp(code.trim());
      await getMe();
      setStatus("Phone verified. You can continue to host registration.");
    } catch (error) {
      setStatus(getApiMessage(error, "OTP form validated. Check backend logs for the dev OTP."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setStatus("");
    setIsLoading(true);
    try {
      await requestPhoneOtp();
      setStatus("OTP resent. In local/dev, check backend logs.");
    } catch (error) {
      setStatus(getApiMessage(error, "Resend action is ready. Backend may not be running."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="kinetic-grid flex min-h-screen items-center justify-center px-5 py-8">
      <section className="glass-panel w-full max-w-xl rounded-xl p-6 shadow-ambient outline outline-1 outline-white/5 sm:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-secondary">Phone OTP</p>
            <h1 className="mt-2 font-headline text-4xl font-black text-on-surface">Verify your phone</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-on-surface-variant">
              Enter the OTP sent to {phone || "your registered phone"}. In local/dev, the backend prints it in logs.
            </p>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-on-secondary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <form className="space-y-5" onSubmit={handleVerify} noValidate>
          <TextField
            label="OTP code"
            name="code"
            inputMode="numeric"
            placeholder="123456"
            value={code}
            error={error}
            onChange={(event) => {
              setCode(event.target.value);
              setError("");
              setStatus("");
            }}
          />

          {status ? (
            <p className="flex items-center gap-2 rounded-lg bg-secondary/12 px-4 py-3 text-sm font-bold text-secondary">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {status}
            </p>
          ) : null}

          <Button className="w-full" isLoading={isLoading} type="submit">
            Verify phone
          </Button>
          <Button className="w-full" disabled={isLoading} type="button" variant="secondary" onClick={handleResend}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Resend OTP
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-semibold">
          <Link className="text-primary hover:text-secondary" href="/profile">
            View profile
          </Link>
          <Link className="text-primary hover:text-secondary" href="/host/register">
            Host registration
          </Link>
        </div>
      </section>
    </main>
  );
}
