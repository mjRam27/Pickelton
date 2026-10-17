// partner/app/partner/(portal)/courts/add/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CourtSport, CourtStatus } from "@pickelton/types";
import { usePartner } from "../../../../../components/partner/PartnerShell";
import { Notice, PageHeader, sportLabel, sportTone } from "../../../../../components/ui";
import { errorMessage, money, partnerApi } from "../../../../../lib/partner";
import "../courts.css";

const SURFACES = ["Cushioned acrylic", "Sprung wooden floor", "Synthetic PU", "Concrete (outdoor)"];

export default function AddCourtPage() {
  const router = useRouter();
  const { partner } = usePartner();
  const [form, setForm] = useState({ name: "", surface: SURFACES[0], hourlyRate: "", description: "" });
  const [sport, setSport] = useState<CourtSport>("PICKLEBALL");
  const [indoor, setIndoor] = useState(true);
  const [status, setStatus] = useState<CourtStatus>("ACTIVE");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (name: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: event.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const hourlyRate = Number(form.hourlyRate);
    if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
      setError("Enter the hourly rate as a number.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await partnerApi.courts.create({ name: form.name.trim(), sport, surface: form.surface, indoor, hourlyRate, description: form.description.trim() || undefined, status });
      router.push("/partner/courts");
    } catch (cause) {
      setError(errorMessage(cause));
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader crumbs={<><Link href="/partner/courts">Courts</Link><span aria-hidden="true">/</span><span>Add court</span></>} title="Add a court">
        <Link className="btn" href="/partner/courts">Cancel</Link>
        <button className="btn primary" disabled={saving} form="add-court" type="submit">{saving ? <span className="spinner" /> : null}Save court</button>
      </PageHeader>
      <div className="addLayout">
        <form id="add-court" onSubmit={submit}>
          <section className="card padded">
            <h2>Basics</h2>
            <div className="formGrid">
              <div className="field"><label htmlFor="ac-name">Court name</label><input className="input" id="ac-name" maxLength={120} minLength={2} onChange={set("name")} placeholder="Court 1" required value={form.name} /></div>
              <div className="field"><label htmlFor="ac-surface">Surface</label><select className="input" id="ac-surface" onChange={set("surface")} value={form.surface}>{SURFACES.map((surface) => <option key={surface}>{surface}</option>)}</select></div>
            </div>
            <div className="field">
              <span className="fieldLabel">Sport</span>
              <div className="row">
                {(["PICKLEBALL", "BADMINTON", "MULTI_SPORT"] as CourtSport[]).map((value) => <button aria-pressed={sport === value} className="chip" key={value} onClick={() => setSport(value)} type="button">{sportLabel(value)}</button>)}
              </div>
            </div>
            <fieldset className="radioRow" style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="srOnly">Indoor or outdoor</legend>
              <label><input checked={indoor} name="ac-io" onChange={() => setIndoor(true)} type="radio" />Indoor</label>
              <label><input checked={!indoor} name="ac-io" onChange={() => setIndoor(false)} type="radio" />Outdoor</label>
            </fieldset>
          </section>
          <section className="card padded">
            <h2>Pricing &amp; availability</h2>
            <div className="formGrid">
              <div className="field"><label htmlFor="ac-rate">Price per hour (₹)</label><input className="input" id="ac-rate" inputMode="decimal" onChange={set("hourlyRate")} placeholder="800" required value={form.hourlyRate} /></div>
              <div className="field"><label htmlFor="ac-status">Status</label><select className="input" id="ac-status" onChange={(event) => setStatus(event.target.value as CourtStatus)} value={status}><option value="ACTIVE">Bookable now</option><option value="MAINTENANCE">In maintenance</option><option value="INACTIVE">Hidden from players</option></select></div>
            </div>
            <div className="field"><label htmlFor="ac-desc">Description</label><textarea className="input" id="ac-desc" maxLength={1000} onChange={set("description")} placeholder="Lighting, nets, what's included" rows={3} value={form.description} /></div>
          </section>
          <Notice message={error} />
        </form>
        <aside aria-label="Preview" className="preview">
          <span className="previewLabel">Players will see</span>
          <div className="previewCard">
            <div className="previewArt">
              <svg aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 300 120">
                <g fill="none" opacity="0.6" stroke="#C8F03C" strokeWidth="2"><rect height="90" width="240" x="30" y="15" /><path d="M30 60h240M150 15v90" /></g>
              </svg>
            </div>
            <div className="row between" style={{ alignItems: "flex-start" }}>
              <span className="headStack"><span className="display" style={{ fontSize: 28 }}>{form.name || "Court name"}</span><span className="muted">{partner.business_name} · {indoor ? "Indoor" : "Outdoor"}</span></span>
              <span className={`tag ${sportTone(sport)}`}>{sportLabel(sport)}</span>
            </div>
            <div className="previewPrice"><strong className="display">{money(Number(form.hourlyRate) || 0)}</strong><span className="muted">/ hour</span></div>
            <span className="previewCta">Book a slot</span>
          </div>
        </aside>
      </div>
    </>
  );
}
