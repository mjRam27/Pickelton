// web/components/UpiPayment.tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Copy, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { formatCurrency } from "@pickelton/utils";
import type { Registration, Tournament } from "@pickelton/types";
import { api, errorMessage } from "../lib/session";
import { Notice, Spinner } from "./ui";

// UPI deep link: any UPI app (GPay, PhonePe, Paytm, BHIM) opens with payee, amount and note filled in.
export function upiLink(tournament: Tournament, registration: Registration) {
  const params = {
    pa: tournament.upiId ?? "",
    pn: tournament.payeeName || tournament.createdBy.name,
    am: Number(registration.amountDue ?? 0).toFixed(2),
    cu: "INR",
    tn: `${tournament.name.slice(0, 40)} ${registration.id.slice(0, 6).toUpperCase()}`,
  };
  // UPI apps expect a literal "@" in the VPA and %20 (not "+") for spaces.
  const query = Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%40/g, "@")}`).join("&");
  return `upi://pay?${query}`;
}

// Pay the host by UPI, then submit the UTR so the host can match it against their account.
export function UpiPayment({ tournament, registration, onUpdated }: {
  tournament: Tournament;
  registration: Registration;
  onUpdated: (registration: Registration) => void;
}) {
  const link = upiLink(tournament, registration);
  const [qr, setQr] = useState("");
  const [reference, setReference] = useState(registration.paymentReference ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    QRCode.toDataURL(link, { margin: 1, width: 240 }).then(setQr).catch(() => setQr(""));
  }, [link]);

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text).catch(() => undefined);
    setCopied(`${label} copied.`);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      onUpdated(await api.tournaments.submitPayment(tournament.id, reference.trim()));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  const amount = formatCurrency(Number(registration.amountDue ?? 0));
  return (
    <section className="card" style={{ borderColor: "var(--acc)" }}>
      <div className="row between">
        <h2>Pay your entry fee</h2>
        <span className="display" style={{ fontSize: 40 }}>{amount}</span>
      </div>
      {registration.paymentStatus === "REJECTED" ? (
        <Notice message={`The host couldn't match your last payment${registration.hostNote ? `: ${registration.hostNote}` : "."} Check the reference and submit it again.`} />
      ) : null}
      <div className="row" style={{ alignItems: "flex-start", gap: 20 }}>
        {qr ? <img alt={`UPI QR code to pay ${amount} to ${tournament.payeeName || tournament.upiId}`} height={200} src={qr} style={{ background: "#FFFFFF", borderRadius: 16, padding: 8 }} width={200} /> : null}
        <div className="vstack" style={{ flex: "1 1 260px" }}>
          <ol className="muted" style={{ lineHeight: 1.6, margin: 0, paddingLeft: 18 }}>
            <li>Scan the QR code with any UPI app, or tap <strong>Pay with UPI app</strong> on your phone.</li>
            <li>Pay <strong style={{ color: "var(--text)" }}>{amount}</strong> to <strong style={{ color: "var(--text)" }}>{tournament.payeeName || tournament.createdBy.name}</strong>.</li>
            <li>Copy the 12-digit <strong>UTR / UPI reference</strong> from the payment receipt and enter it below.</li>
          </ol>
          <div className="row">
            <a className="btn primary" href={link}><Smartphone aria-hidden="true" size={18} />Pay with UPI app</a>
            <button className="btn" onClick={() => copy(tournament.upiId ?? "", "UPI ID")} type="button"><Copy aria-hidden="true" size={16} />{tournament.upiId}</button>
          </div>
          {tournament.paymentInstructions ? <p style={{ background: "var(--s2)", borderRadius: 12, margin: 0, padding: "10px 12px" }}>{tournament.paymentInstructions}</p> : null}
          <span className="hint">If the app says the payment can't be completed, pay by scanning the QR code or entering the UPI ID and amount manually.</span>
        </div>
      </div>
      <form className="row" onSubmit={submit} style={{ alignItems: "flex-end", borderTop: "1px solid var(--line)", paddingTop: 14 }}>
        <div className="field" style={{ flex: "1 1 220px" }}>
          <label htmlFor="utr">UPI transaction reference (UTR)</label>
          <input autoComplete="off" className="input" id="utr" inputMode="numeric" maxLength={35} minLength={6} onChange={(event) => setReference(event.target.value.replace(/\s/g, ""))} pattern="[A-Za-z0-9]{6,35}" placeholder="e.g. 412345678901" required value={reference} />
        </div>
        <button className="btn primary" disabled={saving || reference.length < 6} type="submit">{saving ? <Spinner /> : null}{registration.paymentStatus === "SUBMITTED" ? "Update reference" : "I've paid, submit reference"}</button>
      </form>
      <Notice message={copied} tone="success" />
      <Notice message={error} />
    </section>
  );
}
