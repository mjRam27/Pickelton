"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Plus, Trophy } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { getApiMessage } from "@/services/api";
import { AuthUser, getMe, getStoredUser } from "@/services/auth";
import { getMyHostVerification, HostVerification } from "@/services/host";
import { createTournament } from "@/services/tournaments";

type TournamentForm = {
  name: string;
  description: string;
  sportType: string;
  tournamentType: string;
  maxPlayers: string;
  startDate: string;
  entryFee: string;
  clubId: string;
};

type TournamentErrors = Partial<Record<keyof TournamentForm, string>>;

const sportOptions = [
  { label: "Choose sport", value: "" },
  { label: "Pickleball", value: "PICKLEBALL" },
  { label: "Badminton", value: "BADMINTON" },
  { label: "Tennis", value: "TENNIS" }
];

const tournamentTypeOptions = [
  { label: "Choose type", value: "" },
  { label: "Practice", value: "PRACTICE" },
  { label: "Official", value: "OFFICIAL" }
];

function validateTournament(values: TournamentForm): TournamentErrors {
  const errors: TournamentErrors = {};
  const maxPlayers = Number(values.maxPlayers);
  const entryFee = Number(values.entryFee || 0);
  const selectedDate = values.startDate ? new Date(values.startDate) : null;

  if (!values.name.trim()) {
    errors.name = "Tournament name is required.";
  } else if (values.name.trim().length < 3) {
    errors.name = "Use at least 3 characters.";
  }

  if (!values.sportType) errors.sportType = "Choose a sport type.";
  if (!values.tournamentType) errors.tournamentType = "Choose a tournament type.";

  if (!values.maxPlayers) {
    errors.maxPlayers = "Max players is required.";
  } else if (!Number.isInteger(maxPlayers) || maxPlayers < 2) {
    errors.maxPlayers = "Enter a whole number of 2 or more.";
  } else if (maxPlayers > 256) {
    errors.maxPlayers = "Keep this tournament at 256 players or fewer.";
  }

  if (values.entryFee && (Number.isNaN(entryFee) || entryFee < 0)) {
    errors.entryFee = "Entry fee cannot be negative.";
  }

  if (!values.startDate) {
    errors.startDate = "Start date is required.";
  } else if (selectedDate && selectedDate < new Date()) {
    errors.startDate = "Choose a future date and time.";
  }

  return errors;
}

export default function CreateTournamentPage() {
  const [values, setValues] = useState<TournamentForm>({
    name: "",
    description: "",
    sportType: "",
    tournamentType: "",
    maxPlayers: "",
    startDate: "",
    entryFee: "",
    clubId: ""
  });
  const [touched, setTouched] = useState<Partial<Record<keyof TournamentForm, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [host, setHost] = useState<HostVerification | null>(null);

  const errors = useMemo(() => validateTournament(values), [values]);
  const showError = (field: keyof TournamentForm) => (touched[field] || submitted ? errors[field] : undefined);

  function updateField(field: keyof TournamentForm, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setStatus("");
  }

  useEffect(() => {
    setUser(getStoredUser());
    getMe()
      .then((response) => setUser(response.data))
      .catch(() => undefined);
    getMyHostVerification()
      .then((response) => setHost(response.data))
      .catch(() => undefined);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setStatus("");

    if (!user?.phoneVerified) {
      setStatus("Verify phone OTP before creating a tournament.");
      return;
    }
    if (host?.status !== "APPROVED") {
      setStatus("Tournament creation requires approved host verification.");
      return;
    }

    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      await createTournament({
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        sportType: values.sportType,
        tournamentType: values.tournamentType,
        maxPlayers: Number(values.maxPlayers),
        startDate: values.startDate,
        entryFee: values.entryFee ? Number(values.entryFee) : 0,
        clubId: values.clubId.trim() || undefined
      });
      setStatus("Tournament draft validated.");
    } catch (error) {
      setStatus(getApiMessage(error, "Tournament draft validated."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="kinetic-grid min-h-screen px-5 py-6 sm:px-8 lg:px-10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link
          href="/host/register"
          className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm font-extrabold text-primary transition hover:bg-primary/12"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Host registration
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/12 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-secondary">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Tournament draft
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="pt-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">Tournament setup</p>
          <h1 className="mt-4 max-w-xl font-headline text-5xl font-black leading-[0.96] text-on-surface sm:text-6xl">
            Register the next bracket.
          </h1>
          <p className="mt-6 max-w-lg text-base font-medium leading-7 text-on-surface-variant">
            This screen now matches the provided backend tournament create contract, including optional club ID and
            entry fee.
          </p>

          <div className="mt-8 rounded-lg bg-black/45 p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
              Required flow
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-on-surface">
              Register/Login &gt; Verify OTP &gt; Submit KYC &gt; Admin approval &gt; Create tournament
            </p>
            <p className={`mt-3 font-headline text-2xl font-black ${host?.status === "APPROVED" ? "text-secondary" : "text-error"}`}>
              Host status: {host?.status ?? "NOT_SUBMITTED"}
            </p>
            <Link className="mt-3 inline-flex text-sm font-extrabold text-primary hover:text-secondary" href="/host/status">
              Check host status
            </Link>
          </div>

          <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
            {[
              ["Type", values.tournamentType || "Pending"],
              ["Sport", values.sportType || "Pending"],
              ["Slots", values.maxPlayers || "0"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-surface-low px-4 py-4">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
                  {label}
                </p>
                <p className="mt-2 truncate font-headline text-xl font-black text-primary">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <form
          className="glass-panel rounded-xl p-5 shadow-ambient outline outline-1 outline-white/5 sm:p-8"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="mb-7 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Draft details</p>
              <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">Create tournament</h2>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-on-secondary">
              <Plus className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <div className="space-y-5">
            <TextField
              label="Tournament name"
              name="name"
              placeholder="Westside Smash Open"
              value={values.name}
              error={showError("name")}
              onBlur={() => setTouched((current) => ({ ...current, name: true }))}
              onChange={(event) => updateField("name", event.target.value)}
            />

            <TextField
              label="Description"
              name="description"
              placeholder="Optional"
              value={values.description}
              onChange={(event) => updateField("description", event.target.value)}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Sport type"
                name="sportType"
                options={sportOptions}
                value={values.sportType}
                error={showError("sportType")}
                onBlur={() => setTouched((current) => ({ ...current, sportType: true }))}
                onChange={(event) => updateField("sportType", event.target.value)}
              />
              <SelectField
                label="Tournament type"
                name="tournamentType"
                options={tournamentTypeOptions}
                value={values.tournamentType}
                error={showError("tournamentType")}
                onBlur={() => setTouched((current) => ({ ...current, tournamentType: true }))}
                onChange={(event) => updateField("tournamentType", event.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Max players"
                name="maxPlayers"
                type="number"
                min={2}
                max={256}
                placeholder="32"
                value={values.maxPlayers}
                error={showError("maxPlayers")}
                onBlur={() => setTouched((current) => ({ ...current, maxPlayers: true }))}
                onChange={(event) => updateField("maxPlayers", event.target.value)}
              />
              <TextField
                label="Start date and time"
                name="startDate"
                type="datetime-local"
                value={values.startDate}
                error={showError("startDate")}
                onBlur={() => setTouched((current) => ({ ...current, startDate: true }))}
                onChange={(event) => updateField("startDate", event.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Entry fee"
                name="entryFee"
                type="number"
                min={0}
                placeholder="0"
                value={values.entryFee}
                error={showError("entryFee")}
                onBlur={() => setTouched((current) => ({ ...current, entryFee: true }))}
                onChange={(event) => updateField("entryFee", event.target.value)}
              />
              <TextField
                label="Club ID"
                name="clubId"
                placeholder="Optional UUID"
                helperText="Optional. Later this can become a club picker."
                value={values.clubId}
                onChange={(event) => updateField("clubId", event.target.value)}
              />
            </div>

            {status ? (
              <p
                className="flex items-center gap-2 rounded-lg bg-secondary/12 px-4 py-3 text-sm font-bold text-secondary"
                role="status"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {status}
              </p>
            ) : null}

            <Button className="w-full" isLoading={isLoading} type="submit">
              Validate tournament draft
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
