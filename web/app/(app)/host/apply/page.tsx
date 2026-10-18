// web/app/(app)/host/apply/page.tsx
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, FileUp } from "lucide-react";
import { Notice, PageHeader, Spinner } from "../../../../components/ui";
import { api, errorMessage } from "../../../../lib/session";

type UploadField = "documentImageUrl" | "selfieWithDocumentUrl";
const MAX_BYTES = 8 * 1024 * 1024;

export default function HostApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "", dateOfBirth: "", phoneNumber: "", addressLine1: "", city: "", stateRegion: "Karnataka",
    postalCode: "", idDocumentNumberLast4: "", documentImageUrl: "", selfieWithDocumentUrl: "",
  });
  const [fileNames, setFileNames] = useState<Record<UploadField, string>>({ documentImageUrl: "", selfieWithDocumentUrl: "" });
  const [agreed, setAgreed] = useState(false);
  const [uploading, setUploading] = useState<UploadField | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (name: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: event.target.value }));

  async function upload(field: UploadField, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) return setError("Files must be 8 MB or smaller.");
    setUploading(field);
    setError("");
    try {
      const result = await api.host.upload(file, file.name);
      setForm((current) => ({ ...current, [field]: result.url }));
      setFileNames((current) => ({ ...current, [field]: file.name }));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setUploading("");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.documentImageUrl || !form.selfieWithDocumentUrl) return setError("Upload both your ID document and a selfie holding it.");
    if (!agreed) return setError("Please accept the terms and data processing consent.");
    setSaving(true);
    try {
      await api.host.submit({ ...form, phoneNumber: form.phoneNumber.replace(/\s/g, ""), idDocumentType: "AADHAAR", termsAccepted: true, dataProcessingConsent: true });
      router.replace("/host");
    } catch (cause) {
      setError(errorMessage(cause));
      setSaving(false);
    }
  }

  const uploadRow = (field: UploadField, label: string) => (
    <label className="listRow" style={{ borderColor: form[field] ? "var(--acc)" : undefined, borderStyle: form[field] ? "solid" : "dashed", cursor: "pointer" }}>
      <span className="dateBlock" style={{ height: 44, width: 44 }}>{uploading === field ? <Spinner /> : form[field] ? <Check aria-hidden="true" color="var(--acc-ink)" size={20} /> : <FileUp aria-hidden="true" color="var(--hot-ink)" size={20} />}</span>
      <span className="grow"><strong>{label}</strong><small>{uploading === field ? "Uploading…" : fileNames[field] || "JPEG, PNG or PDF, up to 8 MB"}</small></span>
      <span style={{ color: "var(--acc-ink)", fontSize: 13, fontWeight: 800 }}>{form[field] ? "Change" : "Choose file"}</span>
      <input accept="image/jpeg,image/png,application/pdf" className="srOnly" disabled={Boolean(uploading)} onChange={(event) => upload(field, event)} type="file" />
    </label>
  );

  return (
    <form className="vstack" onSubmit={submit} style={{ gap: 20, maxWidth: 820 }}>
      <PageHeader crumbs={<><Link href="/host">Host desk</Link><span aria-hidden="true">/</span><span>Apply</span></>} sub="Verified hosts collect entry fees in the app and get the blue badge. An admin reviews every application; it's never automatic." title="Become a verified host">
        <button className="btn primary" disabled={saving || Boolean(uploading)} type="submit">{saving ? <Spinner /> : null}Submit application</button>
      </PageHeader>
      <section className="card">
        <h2>Your details</h2>
        <div className="field"><label htmlFor="ha-name">Full name (as on your ID)</label><input autoComplete="name" className="input" id="ha-name" maxLength={160} onChange={set("fullName")} required value={form.fullName} /></div>
        <div className="formGrid">
          <div className="field"><label htmlFor="ha-dob">Date of birth</label><input className="input" id="ha-dob" max={new Date().toISOString().slice(0, 10)} onChange={set("dateOfBirth")} required type="date" value={form.dateOfBirth} /></div>
          <div className="field"><label htmlFor="ha-phone">Phone</label><input autoComplete="tel" className="input" id="ha-phone" onChange={set("phoneNumber")} placeholder="+91" required type="tel" value={form.phoneNumber} /></div>
        </div>
        <div className="field"><label htmlFor="ha-address">Address</label><input autoComplete="street-address" className="input" id="ha-address" maxLength={180} onChange={set("addressLine1")} required value={form.addressLine1} /></div>
        <div className="formGrid">
          <div className="field"><label htmlFor="ha-city">City</label><input className="input" id="ha-city" maxLength={100} onChange={set("city")} required value={form.city} /></div>
          <div className="field"><label htmlFor="ha-state">State</label><input className="input" id="ha-state" maxLength={100} onChange={set("stateRegion")} value={form.stateRegion} /></div>
          <div className="field"><label htmlFor="ha-postal">Postal code</label><input autoComplete="postal-code" className="input" id="ha-postal" maxLength={32} onChange={set("postalCode")} required value={form.postalCode} /></div>
        </div>
      </section>
      <section className="card">
        <h2>Identity document</h2>
        <div className="field" style={{ maxWidth: 280 }}><label htmlFor="ha-last4">Aadhaar, last 4 characters</label><input className="input" id="ha-last4" maxLength={4} minLength={4} onChange={set("idDocumentNumberLast4")} pattern="[A-Za-z0-9]{4}" required value={form.idDocumentNumberLast4} /></div>
        {uploadRow("documentImageUrl", "Aadhaar document")}
        {uploadRow("selfieWithDocumentUrl", "Selfie with document")}
        <span className="hint">Files are stored privately and only seen by our verification team.</span>
        <label className="check"><input checked={agreed} onChange={(event) => setAgreed(event.target.checked)} type="checkbox" />I accept the host terms and consent to Pickelton processing my identity data for verification.</label>
      </section>
      <Notice message={error} />
    </form>
  );
}
