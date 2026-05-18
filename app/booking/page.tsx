"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarCheck, Clock, MapPin, Sparkles } from "lucide-react";
import { AppNav } from "@/components/app/AppNav";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";

type BookingForm = {
  city: string;
  venue: string;
  date: string;
  time: string;
  duration: string;
};

const venueOptions = [
  { label: "Choose venue", value: "" },
  { label: "Indiranagar Sports Arena", value: "indiranagar" },
  { label: "Whitefield Pickle Hub", value: "whitefield" },
  { label: "Koramangala Court House", value: "koramangala" }
];

const suggestedSlots = ["06:00", "07:30", "18:00", "19:30", "21:00"];

export default function BookingPage() {
  const [values, setValues] = useState<BookingForm>({ city: "", venue: "", date: "", time: "", duration: "60" });
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("");

  const errors = useMemo(() => {
    const next: Partial<Record<keyof BookingForm, string>> = {};
    if (!values.city.trim()) next.city = "City is required.";
    if (!values.venue) next.venue = "Choose a venue.";
    if (!values.date) next.date = "Date is required.";
    if (!values.time) next.time = "Time is required.";
    return next;
  }, [values]);

  function updateField(field: keyof BookingForm, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setStatus("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    setStatus("Booking request validated. API integration can connect next.");
  }

  return (
    <main className="kinetic-grid min-h-screen">
      <AppNav />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-0">
        <div className="space-y-5">
          <div className="surface-panel rounded-xl p-6 outline outline-1 outline-white/5">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">Court booking</p>
            <h1 className="mt-4 font-headline text-5xl font-black leading-[0.96] text-on-surface sm:text-6xl">
              Find your next court.
            </h1>
            <p className="mt-5 text-base font-semibold leading-7 text-on-surface-variant">
              A focused booking surface for players: city, venue, date, time, slot duration, and acknowledgement in one
              calm flow.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              [MapPin, "Location first", "See venue context before committing."],
              [Clock, "Fast slots", "Pick common morning or evening times."],
              [CalendarCheck, "Acknowledgement", "Clear validated confirmation state."]
            ].map(([Icon, label, text]) => (
              <div key={String(label)} className="motion-card rounded-lg bg-black/45 p-4 outline outline-1 outline-white/5">
                <Icon className="h-6 w-6 text-secondary" aria-hidden="true" />
                <p className="mt-3 font-headline text-xl font-black text-on-surface">{String(label)}</p>
                <p className="mt-1 text-sm font-semibold text-on-surface-variant">{String(text)}</p>
              </div>
            ))}
          </div>
        </div>

        <form className="glass-panel rounded-xl p-5 shadow-ambient outline outline-1 outline-white/5 sm:p-8" onSubmit={handleSubmit} noValidate>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Reserve court</p>
              <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">Book a pickleball slot</h2>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-on-secondary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="City"
                name="city"
                placeholder="Bengaluru"
                value={values.city}
                error={submitted ? errors.city : undefined}
                onChange={(event) => updateField("city", event.target.value)}
              />
              <SelectField
                label="Venue"
                name="venue"
                options={venueOptions}
                value={values.venue}
                error={submitted ? errors.venue : undefined}
                onChange={(event) => updateField("venue", event.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <TextField
                label="Date"
                name="date"
                type="date"
                value={values.date}
                error={submitted ? errors.date : undefined}
                onChange={(event) => updateField("date", event.target.value)}
              />
              <TextField
                label="Time"
                name="time"
                type="time"
                value={values.time}
                error={submitted ? errors.time : undefined}
                onChange={(event) => updateField("time", event.target.value)}
              />
              <SelectField
                label="Duration"
                name="duration"
                options={[
                  { label: "60 min", value: "60" },
                  { label: "90 min", value: "90" },
                  { label: "120 min", value: "120" }
                ]}
                value={values.duration}
                onChange={(event) => updateField("duration", event.target.value)}
              />
            </div>

            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
                Suggested slots
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {suggestedSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`min-h-12 rounded-lg px-3 text-sm font-extrabold transition ${
                      values.time === slot
                        ? "bg-secondary text-on-secondary"
                        : "bg-black/45 text-on-surface-variant outline outline-1 outline-white/5 hover:bg-primary/12 hover:text-primary"
                    }`}
                    onClick={() => updateField("time", slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-black/45 p-4 outline outline-1 outline-white/5">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">Booking summary</p>
              <p className="mt-2 font-headline text-xl font-black text-on-surface">
                {values.venue ? venueOptions.find((venue) => venue.value === values.venue)?.label : "Choose venue"}
              </p>
              <p className="mt-1 text-sm font-semibold text-on-surface-variant">
                {values.date || "Date"} / {values.time || "Time"} / {values.duration} minutes
              </p>
            </div>

            {status ? <p className="rounded-lg bg-secondary/12 px-4 py-3 text-sm font-bold text-secondary">{status}</p> : null}
            <Button className="w-full" type="submit">
              Validate booking
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
