// web/app/(app)/tournaments/new/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Club, RegistrationQuestion, TournamentType } from "@pickelton/types";
import { PhoneVerify } from "../../../../components/PhoneVerify";
import { QuestionBuilder, cleanQuestions } from "../../../../components/QuestionBuilder";
import { Notice, PageHeader, Segmented, Spinner } from "../../../../components/ui";
import { api, errorMessage, useResource, useSession } from "../../../../lib/session";

type Sport = "PICKLEBALL" | "BADMINTON";
const UPI_ID = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

// Any player with a verified phone can host. Payments go straight to the host's UPI ID.
export default function NewTournamentPage() {
  const router = useRouter();
  const session = useSession();
  const { data: clubs } = useResource<Club[]>(() => api.clubs.mine().catch(() => []));
  const [form, setForm] = useState({
    name: "", description: "", clubId: "", venue: "", entryFee: "0", date: "", time: "09:00",
    closeDate: "", closeTime: "21:00", upiId: "", payeeName: "", paymentInstructions: "",
  });
  const [sport, setSport] = useState<Sport>("PICKLEBALL");
  const [type, setType] = useState<TournamentType>("DOUBLES");
  const [maxPlayers, setMaxPlayers] = useState(32);
  const [questions, setQuestions] = useState<RegistrationQuestion[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (name: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: event.target.value }));
  const fee = Number(form.entryFee || 0);
  const today = new Date().toISOString().slice(0, 10);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!Number.isFinite(fee) || fee < 0) return setError("Entry fee must be zero or more.");
    if (fee > 0 && !UPI_ID.test(form.upiId.trim())) return setError("Add your UPI ID (like name@okhdfcbank) so players can pay you.");
    const startDate = `${form.date}T${form.time}:00`;
    const registrationDeadline = form.closeDate ? `${form.closeDate}T${form.closeTime || "23:59"}:00` : undefined;
    if (registrationDeadline && registrationDeadline > startDate) return setError("Registration must close before the tournament starts.");
    if (questions.some((question) => question.type === "SELECT" && cleanQuestions([question])[0]?.options.length < 2)) {
      return setError("Each dropdown question needs at least two options.");
    }
    setSaving(true);
    try {
      const created = await api.tournaments.create({
        name: form.name.trim(), description: form.description.trim() || undefined, clubId: form.clubId || undefined,
        sportType: sport, tournamentType: type, maxPlayers, entryFee: fee, startDate, registrationDeadline,
        venue: form.venue.trim() || undefined,
        upiId: fee > 0 ? form.upiId.trim() : undefined,
        payeeName: fee > 0 ? form.payeeName.trim() || undefined : undefined,
        paymentInstructions: fee > 0 ? form.paymentInstructions.trim() || undefined : undefined,
        registrationQuestions: cleanQuestions(questions),
      });
      router.replace(`/tournaments/${created.id}/manage?created=1`);
    } catch (cause) {
      setError(errorMessage(cause));
      setSaving(false);
    }
  }

  if (session && !session.phoneVerified) {
    return (
      <div className="vstack" style={{ gap: 20, maxWidth: 720 }}>
        <PageHeader title="Host a tournament" />
        <PhoneVerify reason="Hosts need a verified number so players can reach them. We'll text you a code." />
      </div>
    );
  }

  return (
    <form className="vstack" onSubmit={submit} style={{ gap: 20, maxWidth: 860 }}>
      <PageHeader crumbs={<><Link href="/tournaments">Events</Link><span aria-hidden="true">/</span><span>Host a tournament</span></>} sub="Set it up, share the link, and players register and pay you directly by UPI." title="Host a tournament">
        <Link className="btn" href="/tournaments">Cancel</Link>
        <button className="btn primary" disabled={saving} type="submit">{saving ? <Spinner /> : null}Publish & open registration</button>
      </PageHeader>

      <section className="card">
        <h2>Basics</h2>
        <div className="field"><label htmlFor="ct-name">Tournament name</label><input className="input" id="ct-name" maxLength={255} onChange={set("name")} placeholder="Bengaluru Autumn Doubles" required value={form.name} /></div>
        <div className="formGrid">
          <div className="field"><span className="fieldLabel">Sport</span><Segmented full label="Sport" onChange={setSport} options={[{ label: "Pickleball", value: "PICKLEBALL" }, { label: "Badminton", value: "BADMINTON" }]} value={sport} /></div>
          <div className="field"><span className="fieldLabel">Format</span><Segmented full label="Format" onChange={setType} options={[{ label: "Singles", value: "SINGLES" }, { label: "Doubles", value: "DOUBLES" }]} value={type} /></div>
        </div>
        <div className="formGrid">
          <div className="field"><label htmlFor="ct-date">Date</label><input className="input" id="ct-date" min={today} onChange={set("date")} required type="date" value={form.date} /></div>
          <div className="field"><label htmlFor="ct-time">Start time</label><input className="input" id="ct-time" onChange={set("time")} required type="time" value={form.time} /></div>
          <div className="field"><label htmlFor="ct-max">Player limit</label><input className="input" id="ct-max" max={512} min={2} onChange={(event) => setMaxPlayers(Number(event.target.value))} required type="number" value={maxPlayers} /><span className="hint">Registration stops when it's full.</span></div>
        </div>
        <div className="field"><label htmlFor="ct-venue">Venue</label><input className="input" id="ct-venue" maxLength={255} onChange={set("venue")} placeholder="Smash Arena, 12 CMH Road, Indiranagar" value={form.venue} /></div>
        <div className="formGrid">
          <div className="field"><label htmlFor="ct-close-date">Registration closes (optional)</label><input className="input" id="ct-close-date" max={form.date || undefined} min={today} onChange={set("closeDate")} type="date" value={form.closeDate} /></div>
          <div className="field"><label htmlFor="ct-close-time">at</label><input className="input" disabled={!form.closeDate} id="ct-close-time" onChange={set("closeTime")} type="time" value={form.closeTime} /></div>
        </div>
        <div className="field"><label htmlFor="ct-desc">Details for players</label><textarea className="input" id="ct-desc" maxLength={3000} onChange={set("description")} placeholder="Format, divisions, prizes, what to bring, contact for questions" rows={5} value={form.description} /></div>
        {clubs?.length ? (
          <div className="field">
            <label htmlFor="ct-club">Hosting club (optional)</label>
            <select className="input" id="ct-club" onChange={set("clubId")} value={form.clubId}>
              <option value="">No club, I'm hosting it myself</option>
              {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
            </select>
          </div>
        ) : null}
      </section>

      <section className="card">
        <h2>Entry fee</h2>
        <div className="field" style={{ maxWidth: 260 }}><label htmlFor="ct-fee">Per player (₹), 0 for free</label><input className="input" id="ct-fee" inputMode="decimal" min={0} onChange={set("entryFee")} required type="number" value={form.entryFee} /></div>
        {fee > 0 ? (
          <>
            <p className="muted" style={{ lineHeight: 1.5, margin: 0 }}>Players pay you directly by UPI. They see a QR code and a pay button, then enter their UTR, and you confirm each payment from your registrations page. Pickelton never holds the money.</p>
            <div className="formGrid">
              <div className="field"><label htmlFor="ct-upi">Your UPI ID</label><input autoComplete="off" className="input" id="ct-upi" maxLength={100} onChange={set("upiId")} placeholder="name@okhdfcbank" required value={form.upiId} /><span className="hint">From GPay, PhonePe or your bank app (linked to the account that should receive the money).</span></div>
              <div className="field"><label htmlFor="ct-payee">Name shown to payers</label><input className="input" id="ct-payee" maxLength={120} onChange={set("payeeName")} placeholder="As on the bank account" value={form.payeeName} /></div>
            </div>
            <div className="field"><label htmlFor="ct-pay-note">Payment instructions (optional)</label><input className="input" id="ct-pay-note" maxLength={1000} onChange={set("paymentInstructions")} placeholder="e.g. Add your name in the UPI note. Refunds until 3 days before." value={form.paymentInstructions} /></div>
          </>
        ) : null}
      </section>

      <section className="card">
        <h2>Registration form</h2>
        <QuestionBuilder onChange={setQuestions} value={questions} />
      </section>

      <Notice message={error} />
      <button className="btn primary block" disabled={saving} type="submit">{saving ? <Spinner /> : null}Publish & open registration</button>
    </form>
  );
}
