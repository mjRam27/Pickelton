// web/components/PhoneVerify.tsx
"use client";

import { useState, type FormEvent } from "react";
import { Smartphone } from "lucide-react";
import { api, errorMessage, updateSession, useSession } from "../lib/session";
import { Notice, Spinner } from "./ui";

// Inline card for verifying the user's phone by SMS code. Renders nothing once the phone is verified.
export function PhoneVerify({ reason = "Verify your phone number to continue." }: { reason?: string }) {
  const session = useSession();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"send" | "verify" | "">("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (!session || session.phoneVerified) return null;

  async function send() {
    setBusy("send");
    setError("");
    setInfo("");
    try {
      await api.auth.sendPhoneCode();
      setSent(true);
      setInfo(`Code sent to ${session!.phoneNumber}.`);
    } catch (cause) {
      // The signup flow already sent a code; the cooldown error just means "use that one".
      const message = errorMessage(cause);
      if (message.toLowerCase().includes("wait before")) {
        setSent(true);
        setInfo("We sent you a code recently. Enter it below, or try again in a minute.");
      } else {
        setError(message);
      }
    } finally {
      setBusy("");
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setBusy("verify");
    setError("");
    try {
      await api.auth.verifyPhoneCode(code.trim());
      updateSession({ phoneVerified: true });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="card" style={{ borderColor: "var(--blu)" }}>
      <div className="row" style={{ flexWrap: "nowrap", gap: 12 }}>
        <Smartphone aria-hidden="true" color="var(--blu-ink)" size={24} />
        <span className="headStack"><strong>Verify your phone</strong><span className="muted" style={{ fontSize: 14 }}>{reason}</span></span>
      </div>
      {sent ? (
        <form className="row" onSubmit={verify} style={{ alignItems: "flex-end" }}>
          <div className="field" style={{ flex: "1 1 160px" }}>
            <label htmlFor="pv-code">6-digit code</label>
            <input autoComplete="one-time-code" className="input" id="pv-code" inputMode="numeric" maxLength={6} minLength={4} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} pattern="[0-9]*" required value={code} />
          </div>
          <button className="btn primary" disabled={busy !== "" || code.length < 4} type="submit">{busy === "verify" ? <Spinner /> : null}Verify</button>
          <button className="btn ghost" disabled={busy !== ""} onClick={send} type="button">Resend</button>
        </form>
      ) : (
        <button className="btn primary" disabled={busy !== ""} onClick={send} style={{ alignSelf: "flex-start" }} type="button">{busy === "send" ? <Spinner /> : null}Send code to {session.phoneNumber}</button>
      )}
      <Notice message={info} tone="success" />
      <Notice message={error} />
    </section>
  );
}
