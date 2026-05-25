import Link from "next/link";
import { ArrowUpRight, Building2, CalendarDays, MapPin, Star, UsersRound, Zap } from "lucide-react";
import { AppNav } from "@/components/app/AppNav";

const clubs = [
  {
    name: "Indiranagar Pickle Club",
    area: "Indiranagar",
    members: "420 members",
    courts: "6 courts",
    tag: "Most active"
  },
  {
    name: "Whitefield Rally House",
    area: "Whitefield",
    members: "280 members",
    courts: "4 courts",
    tag: "Coaching"
  },
  {
    name: "Koramangala Smash Club",
    area: "Koramangala",
    members: "350 members",
    courts: "5 courts",
    tag: "Tournaments"
  }
];

export default function ClubsPage() {
  return (
    <main className="kinetic-grid min-h-screen">
      <AppNav />
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-8 lg:px-0">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="surface-panel rounded-xl p-6 outline outline-1 outline-white/10 sm:p-8">
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-secondary">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Club network
            </p>
            <h1 className="mt-4 font-headline text-5xl font-black leading-[0.96] text-on-surface sm:text-6xl">
              Find your court community.
            </h1>
            <p className="mt-5 text-base font-semibold leading-7 text-on-surface-variant">
              A premium clubs page for discovering nearby pickleball communities, coaching sessions, courts, and weekly
              events.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["1,050+", "Club members"],
                ["15", "Playable courts"],
                ["38", "Weekly sessions"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg bg-black/45 p-4 outline outline-1 outline-white/10">
                  <p className="font-headline text-3xl font-black text-primary">{value}</p>
                  <p className="mt-1 text-sm font-bold text-on-surface-variant">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {clubs.map((club, index) => (
              <article
                key={club.name}
                className="motion-card overflow-hidden rounded-xl bg-surface-low shadow-ambient outline outline-1 outline-white/10 hover:bg-surface-high hover:outline-primary/30"
              >
                <div className="grid gap-0 sm:grid-cols-[160px_1fr]">
                  <div className={`min-h-36 ${index === 0 ? "bg-[#7aa92c]" : index === 1 ? "bg-[#5f8323]" : "bg-[#405d18]"} p-4`}>
                    <div className="h-full rounded-lg border-2 border-white/70">
                      <div className="h-1/2 border-b-2 border-white/70" />
                      <div className="mx-auto h-full w-0.5 -translate-y-1/2 bg-white/70" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-secondary">{club.tag}</p>
                        <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">{club.name}</h2>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                        <Star className="h-3.5 w-3.5" aria-hidden="true" />
                        4.{8 - index}
                      </span>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        [MapPin, club.area],
                        [UsersRound, club.members],
                        [Zap, club.courts]
                      ].map(([Icon, text]) => (
                        <div key={String(text)} className="rounded-lg bg-black/45 p-3 outline outline-1 outline-white/10">
                          <Icon className="h-4 w-4 text-secondary" aria-hidden="true" />
                          <p className="mt-2 text-sm font-bold text-on-surface">{String(text)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-xl bg-surface-low p-5 shadow-ambient outline outline-1 outline-white/10 sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Club calendar</p>
            <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">Upcoming sessions</h2>
            <div className="mt-5 space-y-3">
              {[
                ["Mon", "Beginner coaching", "6:00 PM"],
                ["Wed", "Doubles ladder", "7:30 PM"],
                ["Sat", "Open play social", "8:00 AM"]
              ].map(([day, title, time]) => (
                <div key={title} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg bg-black/45 p-4 outline outline-1 outline-white/10">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-on-secondary font-black">
                    {day}
                  </span>
                  <p className="font-bold text-on-surface">{title}</p>
                  <p className="text-sm font-extrabold text-primary">{time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-surface-low p-5 shadow-ambient outline outline-1 outline-white/10 sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">For organizers</p>
            <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">Launch a club profile</h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-on-surface-variant">
              Club pages can become the home for courts, members, events, coaching sessions, tournament hosting, and
              verified local communities.
            </p>
            <Link
              href="/host/register"
              className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-secondary px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-on-secondary shadow-glow"
            >
              Register host
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="mt-5 rounded-lg bg-black/45 p-4 outline outline-1 outline-white/10">
              <CalendarDays className="h-5 w-5 text-secondary" aria-hidden="true" />
              <p className="mt-3 font-bold text-on-surface">Ready for scheduling</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-on-surface-variant">
                The frontend is shaped for event calendars, court availability, and member activity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
