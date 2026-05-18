"use client";

import Link from "next/link";
import { ArrowLeft, BadgeCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { getApiMessage } from "@/services/api";
import { AuthUser, getMe, getStoredUser } from "@/services/auth";
import { submitHostVerification } from "@/services/host";

type HostForm = {
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  idDocumentType: string;
  idDocumentNumberLast4: string;
  documentImageUrl: string;
  selfieWithDocumentUrl: string;
  termsAccepted: boolean;
  dataProcessingConsent: boolean;
};

type HostErrors = Partial<Record<keyof HostForm, string>>;

const phonePattern = /^\+?[1-9][0-9]{7,14}$/;
const lastFourPattern = /^[A-Za-z0-9]{4}$/;

const idDocumentOptions = [
  { label: "Choose document", value: "" },
  { label: "Aadhaar", value: "AADHAAR" },
  { label: "PAN", value: "PAN" },
  { label: "Voter ID", value: "VOTER_ID" },
  { label: "Passport", value: "PASSPORT" },
  { label: "Driving license", value: "DRIVING_LICENSE" }
];

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateHost(values: HostForm): HostErrors {
  const errors: HostErrors = {};
  const birthday = values.dateOfBirth ? new Date(`${values.dateOfBirth}T00:00:00`) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!values.fullName.trim()) errors.fullName = "Full name is required.";
  if (!values.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  } else if (birthday && birthday >= today) {
    errors.dateOfBirth = "Date of birth must be in the past.";
  }
  if (!values.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!phonePattern.test(values.phoneNumber)) {
    errors.phoneNumber = "Use a valid phone number.";
  }
  if (!values.addressLine1.trim()) errors.addressLine1 = "Address line 1 is required.";
  if (!values.city.trim()) errors.city = "City is required.";
  if (!values.postalCode.trim()) errors.postalCode = "Postal code is required.";
  if (!values.idDocumentType) errors.idDocumentType = "Choose an ID document.";
  if (!values.idDocumentNumberLast4.trim()) {
    errors.idDocumentNumberLast4 = "Last 4 document characters are required.";
  } else if (!lastFourPattern.test(values.idDocumentNumberLast4)) {
    errors.idDocumentNumberLast4 = "Use exactly 4 letters or numbers.";
  }
  if (!values.documentImageUrl.trim()) {
    errors.documentImageUrl = "Document image URL is required.";
  } else if (!isValidUrl(values.documentImageUrl)) {
    errors.documentImageUrl = "Enter a valid http or https URL.";
  }
  if (!values.selfieWithDocumentUrl.trim()) {
    errors.selfieWithDocumentUrl = "Selfie with document URL is required.";
  } else if (!isValidUrl(values.selfieWithDocumentUrl)) {
    errors.selfieWithDocumentUrl = "Enter a valid http or https URL.";
  }
  if (!values.termsAccepted) errors.termsAccepted = "Terms must be accepted.";
  if (!values.dataProcessingConsent) errors.dataProcessingConsent = "Data processing consent is required.";

  return errors;
}

export default function HostRegisterPage() {
  const [values, setValues] = useState<HostForm>({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateRegion: "",
    postalCode: "",
    idDocumentType: "",
    idDocumentNumberLast4: "",
    documentImageUrl: "",
    selfieWithDocumentUrl: "",
    termsAccepted: false,
    dataProcessingConsent: false
  });
  const [touched, setTouched] = useState<Partial<Record<keyof HostForm, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const errors = useMemo(() => validateHost(values), [values]);
  const showError = (field: keyof HostForm) => (touched[field] || submitted ? errors[field] : undefined);

  function updateField(field: keyof HostForm, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
    setStatus("");
  }

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    if (stored?.phoneNumber) {
      setValues((current) => ({ ...current, phoneNumber: stored.phoneNumber }));
    }

    getMe()
      .then((response) => {
        setUser(response.data);
        if (response.data?.phoneNumber) {
          setValues((current) => ({ ...current, phoneNumber: response.data.phoneNumber }));
        }
      })
      .catch(() => undefined);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setStatus("");

    if (!user?.phoneVerified) {
      setStatus("Verify phone OTP before submitting host KYC.");
      return;
    }

    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      await submitHostVerification({
        fullName: values.fullName.trim(),
        dateOfBirth: values.dateOfBirth,
        phoneNumber: values.phoneNumber.trim(),
        addressLine1: values.addressLine1.trim(),
        addressLine2: values.addressLine2.trim() || undefined,
        city: values.city.trim(),
        stateRegion: values.stateRegion.trim() || undefined,
        postalCode: values.postalCode.trim(),
        idDocumentType: values.idDocumentType,
        idDocumentNumberLast4: values.idDocumentNumberLast4.trim(),
        documentImageUrl: values.documentImageUrl.trim(),
        selfieWithDocumentUrl: values.selfieWithDocumentUrl.trim(),
        termsAccepted: values.termsAccepted,
        dataProcessingConsent: values.dataProcessingConsent
      });
      setStatus("Host verification submitted.");
    } catch (error) {
      setStatus(getApiMessage(error, "Host registration form validated. Login/backend connection may be needed."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="kinetic-grid min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm font-extrabold text-primary transition hover:bg-primary/12"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Login
        </Link>
        <Link
          href="/tournaments/create"
          className="inline-flex items-center gap-2 rounded-full bg-secondary/12 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-secondary"
        >
          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
          Tournament draft
        </Link>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-8 py-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div className="pt-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">Host verification</p>
          <h1 className="mt-4 max-w-xl font-headline text-5xl font-black leading-[0.96] text-on-surface sm:text-6xl">
            Register as a trusted host.
          </h1>
          <p className="mt-6 max-w-lg text-base font-medium leading-7 text-on-surface-variant">
            This form matches the Spring Boot host verification contract and prepares the account to create official
            Pickelton tournaments.
          </p>
          <div className="mt-8 rounded-lg bg-black/45 p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
              Phone verification gate
            </p>
            <p className={`mt-2 font-headline text-2xl font-black ${user?.phoneVerified ? "text-secondary" : "text-error"}`}>
              {user?.phoneVerified ? "Ready for KYC" : "Verify OTP first"}
            </p>
            {!user?.phoneVerified ? (
              <Link className="mt-3 inline-flex text-sm font-extrabold text-primary hover:text-secondary" href="/verify-phone">
                Go to OTP verification
              </Link>
            ) : null}
          </div>
        </div>

        <form
          className="glass-panel rounded-xl p-5 shadow-ambient outline outline-1 outline-white/5 sm:p-8"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="mb-7 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Identity check</p>
              <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">Host registration</h2>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-on-secondary">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Full name"
                name="fullName"
                value={values.fullName}
                error={showError("fullName")}
                onBlur={() => setTouched((current) => ({ ...current, fullName: true }))}
                onChange={(event) => updateField("fullName", event.target.value)}
              />
              <TextField
                label="Date of birth"
                name="dateOfBirth"
                type="date"
                value={values.dateOfBirth}
                error={showError("dateOfBirth")}
                onBlur={() => setTouched((current) => ({ ...current, dateOfBirth: true }))}
                onChange={(event) => updateField("dateOfBirth", event.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Phone number"
                name="phoneNumber"
                placeholder="+919876543210"
                readOnly
                helperText="Prefilled from logged-in account. KYC phone must match verified phone."
                value={values.phoneNumber}
                error={showError("phoneNumber")}
                onBlur={() => setTouched((current) => ({ ...current, phoneNumber: true }))}
                onChange={(event) => updateField("phoneNumber", event.target.value)}
              />
              <TextField
                label="Postal code"
                name="postalCode"
                value={values.postalCode}
                error={showError("postalCode")}
                onBlur={() => setTouched((current) => ({ ...current, postalCode: true }))}
                onChange={(event) => updateField("postalCode", event.target.value)}
              />
            </div>

            <TextField
              label="Address line 1"
              name="addressLine1"
              value={values.addressLine1}
              error={showError("addressLine1")}
              onBlur={() => setTouched((current) => ({ ...current, addressLine1: true }))}
              onChange={(event) => updateField("addressLine1", event.target.value)}
            />

            <TextField
              label="Address line 2"
              name="addressLine2"
              placeholder="Optional"
              value={values.addressLine2}
              onChange={(event) => updateField("addressLine2", event.target.value)}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="City"
                name="city"
                value={values.city}
                error={showError("city")}
                onBlur={() => setTouched((current) => ({ ...current, city: true }))}
                onChange={(event) => updateField("city", event.target.value)}
              />
              <TextField
                label="State / region"
                name="stateRegion"
                placeholder="Optional"
                value={values.stateRegion}
                onChange={(event) => updateField("stateRegion", event.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="ID document"
                name="idDocumentType"
                options={idDocumentOptions}
                value={values.idDocumentType}
                error={showError("idDocumentType")}
                onBlur={() => setTouched((current) => ({ ...current, idDocumentType: true }))}
                onChange={(event) => updateField("idDocumentType", event.target.value)}
              />
              <TextField
                label="Last 4 ID chars"
                name="idDocumentNumberLast4"
                maxLength={4}
                value={values.idDocumentNumberLast4}
                error={showError("idDocumentNumberLast4")}
                onBlur={() => setTouched((current) => ({ ...current, idDocumentNumberLast4: true }))}
                onChange={(event) => updateField("idDocumentNumberLast4", event.target.value)}
              />
            </div>

            <TextField
              label="Document image URL"
              name="documentImageUrl"
              type="url"
              placeholder="https://..."
              value={values.documentImageUrl}
              error={showError("documentImageUrl")}
              onBlur={() => setTouched((current) => ({ ...current, documentImageUrl: true }))}
              onChange={(event) => updateField("documentImageUrl", event.target.value)}
            />

            <TextField
              label="Selfie with document URL"
              name="selfieWithDocumentUrl"
              type="url"
              placeholder="https://..."
              value={values.selfieWithDocumentUrl}
              error={showError("selfieWithDocumentUrl")}
              onBlur={() => setTouched((current) => ({ ...current, selfieWithDocumentUrl: true }))}
              onChange={(event) => updateField("selfieWithDocumentUrl", event.target.value)}
            />

            {(["termsAccepted", "dataProcessingConsent"] as const).map((field) => (
              <label key={field} className="block rounded-lg bg-black/45 p-4">
                <span className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-outline bg-black text-secondary focus:ring-secondary/30"
                    checked={values[field]}
                    onBlur={() => setTouched((current) => ({ ...current, [field]: true }))}
                    onChange={(event) => updateField(field, event.target.checked)}
                  />
                  <span className="text-sm font-semibold text-on-surface">
                    {field === "termsAccepted"
                      ? "I accept the host verification terms."
                      : "I consent to processing this verification data."}
                  </span>
                </span>
                {showError(field) ? <p className="mt-2 text-sm font-semibold text-error">{showError(field)}</p> : null}
              </label>
            ))}

            {status ? (
              <p className="rounded-lg bg-secondary/12 px-4 py-3 text-sm font-bold text-secondary" role="status">
                {status}
              </p>
            ) : null}

            <Button className="w-full" isLoading={isLoading} type="submit">
              Submit host registration
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
