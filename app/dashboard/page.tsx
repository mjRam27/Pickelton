import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CalendarPlus,
  Clock3,
  MapPin,
  RadioTower,
  Share2,
  Trophy,
  UserRound,
  WalletCards
} from "lucide-react";
import { AppNav } from "@/components/app/AppNav";

const quickActions = [
  { href: "/profile", label: "User profile", icon: UserRound, text: "Verification, account state, and next actions." },
  { href: "/booking", label: "Book a court", icon: CalendarPlus, text: "Pick a venue, slot, and duration in one flow." },
  { href: "/tournaments/create", label: "Host tournament", icon: Trophy, text: "Create organizer-ready tournament drafts." }
];

const tournaments = [
  ["Indiranagar Open", "Pickleball", "May 28", "32 players", "OPEN"],
  ["Weekend Ladder", "Mixed doubles", "Jun 02", "24 players", "FILLING"],
  ["City Smash Cup", "Advanced", "Jun 10", "64 players", "OFFICIAL"]
];

export default function DashboardPage() {
  return (
    <main className="kinetic-grid min-h-screen">
      <AppNav />
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-8 lg:px-0">
        <div className="surface-panel kinetic-orbit overflow-hidden rounded-xl p-5 outline outline-1 outline-white/5 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="float-in">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">Pickleball command center</p>
              <h1 className="mt-4 max-w-3xl font-headline text-5xl font-black leading-[0.94] text-on-surface sm:text-7xl">
                Browse, book, host, score.
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-on-surface-variant">
                A fast first screen for players and organizers: profile readiness, court booking, live tournament
                operations, and host verification are all visible at launch.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/booking"
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-secondary px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-on-secondary"
                >
                  Book now
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/host/register"
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary/14 px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-primary outline outline-1 outline-primary/20"
                >
                  Become host
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                [Activity, "18", "Live matches"],
                [Clock3, "42", "Slots today"],
                [RadioTower, "06", "Host reviews"]
              ].map(([Icon, value, label], index) => (
                <div
                  key={String(label)}
                  className="motion-card lift-loop rounded-lg bg-black/45 p-4 outline outline-1 outline-white/5"
                  style={{ animationDelay: `${index * 180}ms` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Icon className="h-5 w-5 text-secondary" aria-hidden="true" />
                    <span className="live-pulse rounded-full bg-secondary/12 px-2 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-secondary">
                      Active
                    </span>
                  </div>
                  <p className="mt-4 font-headline text-4xl font-black text-on-surface">{String(value)}</p>
                  <p className="mt-1 text-sm font-bold text-on-surface-variant">{String(label)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg bg-black/40 py-3 outline outline-1 outline-white/5">
          <div className="ticker-track flex w-[200%] gap-6 whitespace-nowrap text-xs font-extrabold uppercase tracking-[0.16em] text-on-surface-variant">
            {[
              "Live scoring ready",
              "Host verification gate",
              "Court booking",
              "Payment acknowledgement",
              "Participant reminders",
              "Super admin review",
              "Live scoring ready",
              "Host verification gate",
              "Court booking",
              "Payment acknowledgement",
              "Participant reminders",
              "Super admin review"
            ].map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {quickActions.map(({ href, label, icon: Icon, text }) => (
            <Link
              key={href}
              href={href}
              className="motion-card rounded-xl bg-surface-low p-5 shadow-ambient outline outline-1 outline-white/5 hover:bg-surface-high hover:outline-primary/25"
            >
              <div className="flex items-start justify-between gap-4">
                <Icon className="h-8 w-8 text-secondary" aria-hidden="true" />
                <ArrowUpRight className="h-4 w-4 text-on-surface-variant" aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-headline text-2xl font-black text-on-surface">{label}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-on-surface-variant">{text}</p>
            </Link>
          ))}
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.72fr]">
          <div className="rounded-xl bg-surface-low p-5 shadow-ambient outline outline-1 outline-white/5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Market</p>
                <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">Tournament discovery</h2>
              </div>
              <Link href="/tournaments/create" className="text-sm font-extrabold text-primary hover:text-secondary">
                Host one
              </Link>
            </div>
            <div className="space-y-3">
              {tournaments.map(([name, category, date, players, status]) => (
                <div
                  key={name}
                  className="grid gap-3 rounded-lg bg-black/45 p-4 outline outline-1 outline-white/5 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <div>
                    <p className="font-headline text-xl font-black text-on-surface">{name}</p>
                    <p className="mt-1 text-sm font-semibold text-on-surface-variant">{category} / {date}</p>
                  </div>
                  <p className="rounded-full bg-primary/12 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                    {players}
                  </p>
                  <p className="rounded-full bg-secondary/12 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-secondary">
                    {status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-surface-low p-5 shadow-ambient outline outline-1 outline-white/5 sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Operations</p>
            <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">Player services</h2>
            <div className="mt-5 space-y-4">
              {[
                [WalletCards, "Payment acknowledgement", "Designed space for tournament payment confirmation."],
                [Share2, "Share details", "Hosts can send location, time, fee, and category details."],
                [MapPin, "Reminder ready", "Booking and tournament screens prioritize venue and timing."]
              ].map(([Icon, title, text]) => (
                <div key={String(title)} className="rounded-lg bg-black/45 p-4 outline outline-1 outline-white/5">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="mt-3 font-bold text-on-surface">{String(title)}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-on-surface-variant">{String(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
