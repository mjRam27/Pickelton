import Link from "next/link";
import { BadgeCheck, CalendarPlus, MapPin, UsersRound } from "lucide-react";

export default function HostWelcomePage() {
  return (
    <main className="kinetic-grid flex min-h-screen items-center justify-center px-5 py-8">
      <section className="glass-panel w-full max-w-5xl rounded-xl p-6 shadow-ambient outline outline-1 outline-white/5 sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-secondary">Organizer welcome</p>
        <h1 className="mt-3 max-w-3xl font-headline text-5xl font-black leading-[0.96] text-on-surface sm:text-6xl">
          Welcome to Pickelton hosting.
        </h1>
        <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-on-surface-variant">
          Your host registration can now move through admin verification. Once approved, you can create tournaments,
          collect registrations, share reminders, and track participant scores.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            [BadgeCheck, "Verification", "Owner/admin reviews the host KYC before tournament access."],
            [CalendarPlus, "Tournaments", "Add location, time, category, fees, registration dates, and participant limits."],
            [UsersRound, "Participants", "Prepare registration, payment acknowledgement, reminders, and score visibility."]
          ].map(([Icon, title, text]) => (
            <div key={String(title)} className="rounded-lg bg-black/45 p-5">
              <Icon className="h-7 w-7 text-secondary" aria-hidden="true" />
              <h2 className="mt-4 font-headline text-xl font-black text-on-surface">{String(title)}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-on-surface-variant">{String(text)}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/host/status"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-[#001a63]"
          >
            Check host status
          </Link>
          <Link
            href="/tournaments/create"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-on-secondary"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Create tournament
          </Link>
        </div>
      </section>
    </main>
  );
}
