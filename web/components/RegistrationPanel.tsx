// web/components/RegistrationPanel.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { formatCurrency } from "@pickelton/utils";
import type { Registration, RegistrationQuestion, Tournament } from "@pickelton/types";
import { api, errorMessage, useSession } from "../lib/session";
import { PhoneVerify } from "./PhoneVerify";
import { ConfirmDialog, Notice, Spinner } from "./ui";
import { UpiPayment } from "./UpiPayment";

export function registrationClosedReason(tournament: Tournament) {
  if (tournament.status !== "UPCOMING") return "Registration is closed for this tournament.";
  if (tournament.registrationDeadline && new Date(tournament.registrationDeadline).getTime() < Date.now()) return "Registration has closed.";
  if (new Date(tournament.startDate).getTime() < Date.now()) return "This tournament has already started.";
  if (tournament.registeredCount >= tournament.maxPlayers) return "This tournament is full.";
  return "";
}

// Everything a player does on a tournament page: register (answering the host's questions), pay, track status.
export function RegistrationPanel({ tournament, registration, onChanged }: {
  tournament: Tournament;
  registration: Registration | null;
  onChanged: () => void;
}) {
  const session = useSession();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState<Registration | null>(registration);
  const active = current?.status === "REGISTERED" ? current : null;
  const closed = registrationClosedReason(tournament);
  const fee = Number(tournament.entryFee ?? 0);
  const path = `/tournaments/${tournament.id}`;

  if (!session) {
    return (
      <section className="card">
        <h2>Register</h2>
        <p className="muted" style={{ margin: 0 }}>{closed || `Create a free Pickelton account to register${fee ? ` and pay the ${formatCurrency(fee)} entry fee by UPI` : ""}.`}</p>
        {!closed ? (
          <div className="row">
            <Link className="btn primary" href={`/signup?next=${encodeURIComponent(path)}`}>Sign up to register</Link>
            <Link className="btn" href={`/login?next=${encodeURIComponent(path)}`}>Log in</Link>
          </div>
        ) : null}
      </section>
    );
  }

  async function register(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      setCurrent(await api.tournaments.register(tournament.id, answers));
      onChanged();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setConfirmCancel(false);
    setBusy(true);
    setError("");
    try {
      await api.tournaments.cancelRegistration(tournament.id);
      setCurrent(null);
      onChanged();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  if (active) {
    const paid = active.paymentStatus === "CONFIRMED" || active.paymentStatus === "NOT_REQUIRED";
    return (
      <>
        {paid ? (
          <section className="card" style={{ borderColor: "var(--acc)" }}>
            <div className="row" style={{ color: "var(--acc-ink)", gap: 8 }}><CheckCircle2 aria-hidden="true" size={22} /><h2 style={{ color: "var(--acc-ink)" }}>You're in!</h2></div>
            <p className="muted" style={{ margin: 0 }}>{active.paymentStatus === "CONFIRMED" ? `Payment of ${formatCurrency(Number(active.amountDue ?? 0))} confirmed by the host.` : "Your registration is confirmed."} See you on court.</p>
          </section>
        ) : active.paymentStatus === "SUBMITTED" ? (
          <>
            <section className="card" style={{ borderColor: "var(--blu)" }}>
              <div className="row" style={{ color: "var(--blu-ink)", gap: 8 }}><Clock aria-hidden="true" size={22} /><h2 style={{ color: "var(--blu-ink)" }}>Payment submitted</h2></div>
              <p className="muted" style={{ margin: 0 }}>The host will confirm reference <strong style={{ color: "var(--text)" }}>{active.paymentReference}</strong> once it shows in their account. Your spot is held meanwhile.</p>
            </section>
            <UpiPayment onUpdated={setCurrent} registration={active} tournament={tournament} />
          </>
        ) : (
          <UpiPayment onUpdated={setCurrent} registration={active} tournament={tournament} />
        )}
        {Object.keys(active.answers ?? {}).length ? <Answers answers={active.answers} questions={tournament.registrationQuestions} /> : null}
        {tournament.status === "UPCOMING" ? <button className="btn ghost" disabled={busy} onClick={() => setConfirmCancel(true)} style={{ alignSelf: "flex-start", color: "var(--muted)" }} type="button">Cancel my registration</button> : null}
        <Notice message={error} />
        <ConfirmDialog
          body={active.paymentStatus === "CONFIRMED" || active.paymentStatus === "SUBMITTED" ? "Your spot goes back to the field. Refunds are handled directly by the host." : "Your spot goes back to the field."}
          confirmLabel="Cancel registration" onCancel={() => setConfirmCancel(false)} onConfirm={cancel} open={confirmCancel} title="Cancel registration?"
        />
      </>
    );
  }

  if (closed) {
    return <section className="card"><h2>Register</h2><p className="muted" style={{ margin: 0 }}>{closed}</p></section>;
  }

  if (!session.phoneVerified) {
    return <PhoneVerify reason="Tournament hosts need a verified number to reach players. We'll text you a code." />;
  }

  return (
    <form className="card" onSubmit={register}>
      <div className="row between">
        <h2>Register</h2>
        <span className="muted" style={{ fontWeight: 700 }}>{fee ? `${formatCurrency(fee)} entry · paid by UPI` : "Free entry"}</span>
      </div>
      {tournament.registrationQuestions.map((question) => (
        <QuestionField key={question.id} onChange={(value) => setAnswers((existing) => ({ ...existing, [question.id]: value }))} question={question} value={answers[question.id] ?? ""} />
      ))}
      <Notice message={error} />
      <button className="btn primary" disabled={busy} style={{ alignSelf: "flex-start" }} type="submit">
        {busy ? <Spinner /> : null}{fee ? `Register, then pay ${formatCurrency(fee)}` : "Register"}
      </button>
    </form>
  );
}

function QuestionField({ question, value, onChange }: { question: RegistrationQuestion; value: string; onChange: (value: string) => void }) {
  const id = `q-${question.id}`;
  const label = <>{question.label}{question.required ? <span aria-hidden="true" style={{ color: "var(--hot-ink)" }}> *</span> : null}</>;
  if (question.type === "CHECKBOX") {
    return <label className="check"><input checked={value === "true"} onChange={(event) => onChange(event.target.checked ? "true" : "")} required={question.required} type="checkbox" />{label}</label>;
  }
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {question.type === "SELECT" ? (
        <select className="input" id={id} onChange={(event) => onChange(event.target.value)} required={question.required} value={value}>
          <option value="">Choose…</option>
          {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input className="input" id={id} inputMode={question.type === "NUMBER" ? "decimal" : undefined} maxLength={500} onChange={(event) => onChange(event.target.value)} required={question.required} type={question.type === "NUMBER" ? "number" : "text"} step="any" value={value} />
      )}
    </div>
  );
}

function Answers({ answers, questions }: { answers: Record<string, string>; questions: RegistrationQuestion[] }) {
  return (
    <section className="card">
      <h2>Your answers</h2>
      {questions.filter((question) => answers[question.id]).map((question) => (
        <div className="row between" key={question.id} style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
          <span className="muted">{question.label}</span><strong>{question.type === "CHECKBOX" ? "Yes" : answers[question.id]}</strong>
        </div>
      ))}
    </section>
  );
}
