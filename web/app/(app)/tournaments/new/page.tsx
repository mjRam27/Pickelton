// web/app/(app)/tournaments/new/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import type { Club, TournamentType } from "@pickelton/types";
import { Notice, PageHeader, Segmented, Spinner } from "../../../../components/ui";
import { api, errorMessage, useResource } from "../../../../lib/session";

type Sport = "PICKLEBALL" | "BADMINTON";

export default function NewTournamentPage() {
  const router = useRouter();
  // Only clubs you belong to can host; the backend checks you're an owner/admin.
  const { data: clubs } = useResource<Club[]>(() => api.clubs.mine().catch(() => []));
  const [form, setForm] = useState({ name: "", description: "", clubId: "", entryFee: "0", date: "", time: "09:00" });
  const [sport, setSport] = useState<Sport>("PICKLEBALL");
  const [type, setType] = useState<TournamentType>("DOUBLES");
  const [maxPlayers, setMaxPlayers] = useState(32);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (name: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: event.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const entryFee = Number(form.entryFee || 0);
    if (!Number.isFinite(entryFee) || entryFee < 0) return setError("Entry fee must be zero or more.");
    setSaving(true);
    try {
      const created = await api.tournaments.create({
        name: form.name.trim(), description: form.description.trim() || undefined, clubId: form.clubId || undefined,
        entryFee, maxPlayers, startDate: `${form.date}T${form.time}:00`, sportType: sport, tournamentType: type,
      });
      router.replace(`/tournaments/${created.id}`);
    } catch (cause) {
      setError(errorMessage(cause));
      setSaving(false);
    }
  }

  return (
    <form className="vstack" onSubmit={submit} style={{ gap: 20, maxWidth: 820 }}>
      <PageHeader crumbs={<><Link href="/tournaments">Events</Link><span aria-hidden="true">/</span><span>New tournament</span></>} title="New tournament">
        <Link className="btn" href="/tournaments">Cancel</Link>
        <button className="btn primary" disabled={saving} type="submit">{saving ? <Spinner /> : null}Publish tournament</button>
      </PageHeader>
      <section className="card">
        <div className="field"><label htmlFor="ct-name">Tournament name</label><input className="input" id="ct-name" maxLength={255} onChange={set("name")} placeholder="Bengaluru Winter Smash" required value={form.name} /></div>
        <div className="formGrid">
          <div className="field"><span className="fieldLabel">Sport</span><Segmented full label="Sport" onChange={setSport} options={[{ label: "Pickleball", value: "PICKLEBALL" }, { label: "Badminton", value: "BADMINTON" }]} value={sport} /></div>
          <div className="field"><span className="fieldLabel">Format</span><Segmented full label="Format" onChange={setType} options={[{ label: "Singles", value: "SINGLES" }, { label: "Doubles", value: "DOUBLES" }]} value={type} /></div>
        </div>
        <div className="formGrid">
          <div className="field"><label htmlFor="ct-date">Date</label><input className="input" id="ct-date" min={new Date().toISOString().slice(0, 10)} onChange={set("date")} required type="date" value={form.date} /></div>
          <div className="field"><label htmlFor="ct-time">Start time</label><input className="input" id="ct-time" onChange={set("time")} required type="time" value={form.time} /></div>
          <div className="field"><label htmlFor="ct-max">Max players</label><input className="input" id="ct-max" max={512} min={2} onChange={(event) => setMaxPlayers(Number(event.target.value))} required type="number" value={maxPlayers} /></div>
          <div className="field"><label htmlFor="ct-fee">Entry fee per player (₹)</label><input className="input" id="ct-fee" inputMode="decimal" min={0} onChange={set("entryFee")} type="number" value={form.entryFee} /></div>
        </div>
        <div className="field">
          <label htmlFor="ct-club">Hosting club</label>
          <select className="input" id="ct-club" onChange={set("clubId")} value={form.clubId}>
            <option value="">Choose a club you run</option>
            {(clubs ?? []).map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
          </select>
          <span className="hint">Only club owners and admins can host. Every tournament belongs to one club.</span>
        </div>
        <div className="field"><label htmlFor="ct-desc">Description</label><textarea className="input" id="ct-desc" maxLength={3000} onChange={set("description")} placeholder="Divisions, format, prizes, what to bring" rows={4} value={form.description} /></div>
      </section>
      <Notice message={error} />
      <Link className="listRow" href="/host/apply" style={{ background: "var(--s2)", border: 0 }}>
        <ShieldCheck aria-hidden="true" color="var(--blu-ink)" size={22} />
        <span className="grow"><strong style={{ whiteSpace: "normal" }}>Collect entry fees in the app</strong><small>Become a verified host to take payments and get featured.</small></span>
      </Link>
    </form>
  );
}
