import Link from "next/link";
import { CalendarPlus, MapPin, Share2, Trophy, UserRound, WalletCards } from "lucide-react";
import { AppNav } from "@/components/app/AppNav";

const quickActions = [
  { href: "/profile", label: "User profile", icon: UserRound, text: "View verification status and account details." },
  { href: "/booking", label: "Book a court", icon: CalendarPlus, text: "Reserve pickleball slots with a simple booking UI." },
  { href: "/tournaments/create", label: "Host tournament", icon: Trophy, text: "Create organizer-ready tournament drafts." }
];

const tournaments = [
  ["Indiranagar Open", "Pickleball", "May 28, 2026", "32 players"],
  ["Weekend Ladder", "Mixed doubles", "June 02, 2026", "24 players"],
  ["City Smash Cup", "Advanced", "June 10, 2026", "64 players"]
];

export default function DashboardPage() {
  return (
    <main className="kinetic-grid min-h-screen">
      <AppNav />
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-6 sm:px-8 lg:px-0">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">User experience</p>
            <h1 className="mt-4 max-w-3xl font-headline text-5xl font-black leading-[0.96] text-on-surface sm:text-6xl">
              Browse, book, play, repeat.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-on-surface-variant">
              A simple first screen for players and organizers: profile status, court booking, tournament browsing, and
              host actions are all one tap away.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Easy", "Go"],
              ["User", "Profile"],
              ["Court", "Booking"]
            ].map(([top, bottom]) => (
              <div key={top} className="rounded-lg bg-black/45 p-4 text-center">
                <p className="font-headline text-2xl font-black text-primary">{top}</p>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
                  {bottom}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {quickActions.map(({ href, label, icon: Icon, text }) => (
            <Link key={href} href={href} className="rounded-xl bg-surface-low p-5 shadow-ambient transition hover:scale-[1.01] hover:bg-surface-high">
              <Icon className="h-8 w-8 text-secondary" aria-hidden="true" />
              <h2 className="mt-5 font-headline text-2xl font-black text-on-surface">{label}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-on-surface-variant">{text}</p>
            </Link>
          ))}
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.72fr]">
          <div className="rounded-xl bg-surface-low p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-headline text-3xl font-black text-on-surface">Browse tournaments</h2>
              <Link href="/tournaments/create" className="text-sm font-extrabold text-primary hover:text-secondary">
                Host one
              </Link>
            </div>
            <div className="space-y-3">
              {tournaments.map(([name, category, date, players]) => (
                <div key={name} className="grid gap-3 rounded-lg bg-black/45 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-headline text-xl font-black text-on-surface">{name}</p>
                    <p className="mt-1 text-sm font-semibold text-on-surface-variant">{category} / {date}</p>
                  </div>
                  <p className="rounded-full bg-secondary/12 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-secondary">
                    {players}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-surface-low p-5 sm:p-6">
            <h2 className="font-headline text-3xl font-black text-on-surface">Player services</h2>
            <div className="mt-5 space-y-4">
              {[
                [WalletCards, "Payment acknowledgement", "Prepared UI space for tournament payment confirmation."],
                [Share2, "Share details", "Hosts can share basic tournament info with users."],
                [MapPin, "Location clarity", "Tournament and booking flows prioritize venue and timing."]
              ].map(([Icon, title, text]) => (
                <div key={String(title)} className="rounded-lg bg-black/45 p-4">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="mt-3 font-bold text-on-surface">{String(title)}</p>
                  <p className="mt-1 text-sm font-semibold text-on-surface-variant">{String(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
