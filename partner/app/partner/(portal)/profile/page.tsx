// partner/app/partner/(portal)/profile/page.tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck } from "lucide-react";
import { usePartner } from "../../../../components/partner/PartnerShell";
import { Avatar, LoadError, Loading, Notice, PageHeader } from "../../../../components/ui";
import { errorMessage, partnerApi, useResource } from "../../../../lib/partner";
import "./profile.css";

const AMENITIES = ["Parking", "Changing rooms", "Showers", "Equipment rental", "Café", "Floodlights", "Wheelchair access"];
type VenueExtras = { about?: string; amenities?: string[] };

export default function VenueProfilePage() {
  const { setPartner } = usePartner();
  const { data, error: loadError, loading, reload } = useResource(async () => {
    const [profile, settings] = await Promise.all([partnerApi.profile.get(), partnerApi.settings.get()]);
    return { profile, settings };
  });
  const [form, setForm] = useState({ businessName: "", contactName: "", phone: "", address: "", city: "", state: "", postalCode: "", website: "" });
  const [extras, setExtras] = useState<VenueExtras>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!data) return;
    const p = data.profile;
    setForm({ businessName: p.business_name, contactName: p.contact_name, phone: p.phone, address: p.address ?? "", city: p.city ?? "", state: p.state ?? "", postalCode: p.postal_code ?? "", website: p.website ?? "" });
    setExtras((data.settings.venue as VenueExtras | undefined) ?? {});
  }, [data]);

  const set = (name: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: event.target.value }));
  const toggleAmenity = (amenity: string) => setExtras((current) => {
    const list = current.amenities ?? [];
    return { ...current, amenities: list.includes(amenity) ? list.filter((item) => item !== amenity) : [...list, amenity] };
  });

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!data) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const [profile] = await Promise.all([
        partnerApi.profile.update(form),
        // About and amenities live in the settings document; keep the other settings intact.
        partnerApi.settings.save({ ...data.settings, venue: extras }),
      ]);
      setPartner({ ...data.profile, ...profile });
      setMessage("Venue profile saved.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) return <><PageHeader title="Venue profile" /><Loading label="Loading your venue" /></>;
  if (!data) return <><PageHeader title="Venue profile" /><LoadError message={loadError} onRetry={reload} /></>;

  const address = [form.address, [form.postalCode, form.city].filter(Boolean).join(" "), form.state].filter(Boolean).join(", ");
  return (
    <form className="profileForm" onSubmit={save}>
      <PageHeader sub="What players see on your Pickelton page" title="Venue profile">
        <button className="btn primary" disabled={saving} type="submit">{saving ? <span className="spinner" /> : null}Save changes</button>
      </PageHeader>
      <Notice message={error} />
      <Notice message={message} tone="success" />
      <section className="venueBanner">
        <div className="venueCover">
          <svg aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 150">
            <g fill="none" opacity="0.5" stroke="#C8F03C" strokeWidth="3" transform="rotate(-4 600 75)"><rect height="130" width="1300" x="-50" y="10" /><path d="M-50 75h1300M600 10v130M300 10v130M900 10v130" /></g>
          </svg>
        </div>
        <div className="venueIdentity">
          <span className="venueMark"><Avatar name={form.businessName} square tone="acc" /></span>
          <div className="headStack" style={{ flex: 1, minWidth: 220 }}>
            <span className="display" style={{ fontSize: 32 }}>{form.businessName || "Your venue"}</span>
            <span className="muted">{address || "Add your address so players can find you"}</span>
          </div>
          {data.profile.status === "ACTIVE" ? <span className="badge blu"><BadgeCheck aria-hidden="true" size={16} />Active venue</span> : <span className="badge hot">{data.profile.status.toLowerCase()}</span>}
        </div>
      </section>
      <div className="columns">
        <section className="card padded wide">
          <div className="field"><label htmlFor="vp-about">About the venue</label><textarea className="input" id="vp-about" maxLength={1000} onChange={(event) => setExtras((current) => ({ ...current, about: event.target.value }))} placeholder="Courts, how to get there, what to bring" rows={4} value={extras.about ?? ""} /></div>
          <div className="formGrid">
            <div className="field"><label htmlFor="vp-name">Venue name</label><input className="input" id="vp-name" minLength={2} onChange={set("businessName")} required value={form.businessName} /></div>
            <div className="field"><label htmlFor="vp-contact">Contact person</label><input className="input" id="vp-contact" minLength={2} onChange={set("contactName")} required value={form.contactName} /></div>
            <div className="field"><label htmlFor="vp-phone">Phone</label><input className="input" id="vp-phone" minLength={7} onChange={set("phone")} required type="tel" value={form.phone} /></div>
            <div className="field"><label htmlFor="vp-web">Website</label><input className="input" id="vp-web" onChange={set("website")} placeholder="https://" type="url" value={form.website} /></div>
          </div>
          <div className="field">
            <span className="fieldLabel">Amenities</span>
            <div className="row">{AMENITIES.map((amenity) => <button aria-pressed={(extras.amenities ?? []).includes(amenity)} className="chip" key={amenity} onClick={() => toggleAmenity(amenity)} type="button">{amenity}</button>)}</div>
          </div>
        </section>
        <section className="card padded narrow">
          <h2>Address</h2>
          <div className="field"><label htmlFor="vp-address">Street</label><input className="input" id="vp-address" onChange={set("address")} value={form.address} /></div>
          <div className="formGrid">
            <div className="field"><label htmlFor="vp-city">City</label><input className="input" id="vp-city" onChange={set("city")} value={form.city} /></div>
            <div className="field"><label htmlFor="vp-postal">Postal code</label><input className="input" id="vp-postal" onChange={set("postalCode")} value={form.postalCode} /></div>
          </div>
          <div className="field"><label htmlFor="vp-state">State</label><input className="input" id="vp-state" onChange={set("state")} value={form.state} /></div>
          <span className="muted" style={{ fontSize: 13 }}>Login email: {data.profile.email}</span>
        </section>
      </div>
    </form>
  );
}
