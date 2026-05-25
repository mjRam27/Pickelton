import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Crown,
  Flame,
  MapPin,
  Medal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound
} from "lucide-react";
import { AppNav } from "@/components/app/AppNav";

const tournaments = [
  {
    name: "Bengaluru Smash Open",
    date: "Jun 08",
    venue: "Indiranagar Sports Arena",
    players: "48 / 64",
    level: "Open",
    status: "Registration live",
    accent: "Premier",
    progress: "75%"
  },
  {
    name: "Weekend Ladder Series",
    date: "Jun 15",
    venue: "Whitefield Pickle Hub",
    players: "22 / 32",
    level: "Intermediate",
    status: "Filling fast",
    accent: "Community",
    progress: "68%"
  },
  {
    name: "City Mixed Doubles Cup",
    date: "Jun 22",
    venue: "Koramangala Court House",
    players: "16 / 24",
    level: "Doubles",
    status: "Official",
    accent: "Featured",
    progress: "66%"
  }
];

const bracket = [
  ["Falcons", "11", "Qualifiers"],
  ["Smashers", "8", "Qualifiers"],
  ["Spin Kings", "9", "Semi-final"],
  ["Court Crew", "11", "Semi-final"]
];

const filters = ["All events", "Open", "Intermediate", "Doubles"];

export default function TournamentsPage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-8 sm:pt-8 lg:px-0">
        <div className="overflow-hidden rounded-xl bg-surface-low shadow-ambient outline outline-1 outline-white/10">
          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-5 sm:p-8">
              <p className="inline-flex items-center gap-2 rounded-full bg-secondary/12 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-secondary outline outline-1 outline-secondary/20">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                Tournament hub
              </p>
              <h1 className="mt-5 max-w-3xl font-headline text-4xl font-black leading-[0.96] text-on-surface sm:text-6xl">
                Premium events, polished brackets, zero confusion.
              </h1>
              <p className="mt-5 max-w-2xl text-sm font-semibold leading-6 text-on-surface-variant sm:text-base sm:leading-7">
                Browse official pickleball tournaments, compare venues, track registration momentum, and launch an
                event that looks ready before the first serve.
              </p>

              <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                <Link
                  href="/tournaments/create"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-background shadow-glow"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create event
                </Link>
                <Link
                  href="/scoring"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white/8 px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-on-surface outline outline-1 outline-white/10 transition hover:bg-white/12"
                >
                  Open scorer
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
                {[
                  ["18", "Upcoming"],
                  ["420", "Players"],
                  ["9", "Venues"]
                ].map(([value, label]) => (
                  <div key={label} className="rounded-lg bg-black/35 p-3 outline outline-1 outline-white/10 sm:p-4">
                    <p className="font-headline text-2xl font-black text-on-surface sm:text-3xl">{value}</p>
                    <p className="mt-1 text-[0.7rem] font-bold text-on-surface-variant sm:text-sm">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 bg-[linear-gradient(160deg,#172617,#070b07)] p-5 sm:p-7 lg:border-l lg:border-t-0">
              <div className="rounded-xl bg-black/40 p-4 outline outline-1 outline-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Featured final</p>
                    <h2 className="mt-1 font-headline text-2xl font-black text-on-surface">City Cup bracket</h2>
                  </div>
                  <span className="live-pulse rounded-full bg-secondary/12 px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-secondary">
                    Live
                  </span>
                </div>

                <div className="mt-5 rounded-lg bg-[#6f9f28] p-4 shadow-ambient">
                  <div className="grid gap-3">
                    {bracket.map(([team, score, round]) => (
                      <div
                        key={`${team}-${round}`}
                        className="grid grid-cols-[1fr_auto] items-center rounded-lg bg-black/62 px-4 py-3 outline outline-1 outline-white/15"
                      >
                        <div>
                          <p className="font-headline text-lg font-black text-on-surface">{team}</p>
                          <p className="mt-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-secondary">
                            {round}
                          </p>
                        </div>
                        <p className="font-headline text-3xl font-black text-primary">{score}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    [Crown, "Top seed", "Falcons"],
                    [Flame, "Momentum", "Court Crew"]
                  ].map(([Icon, label, value]) => (
                    <div key={String(label)} className="rounded-lg bg-white/[0.04] p-4 outline outline-1 outline-white/10">
                      <Icon className="h-5 w-5 text-secondary" aria-hidden="true" />
                      <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
                        {String(label)}
                      </p>
                      <p className="mt-1 font-headline text-xl font-black text-on-surface">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl bg-surface-low p-3 shadow-ambient outline outline-1 outline-white/10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex min-h-12 items-center gap-3 rounded-lg bg-black/35 px-4 outline outline-1 outline-white/10">
            <Search className="h-4 w-4 text-secondary" aria-hidden="true" />
            <span className="text-sm font-bold text-on-surface-variant">Search tournaments, venues, or divisions</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {filters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                className={`min-h-11 rounded-lg px-4 text-xs font-extrabold uppercase tracking-[0.08em] outline outline-1 transition ${
                  index === 0
                    ? "bg-primary text-background outline-primary/40"
                    : "bg-white/[0.04] text-on-surface-variant outline-white/10 hover:bg-white/8 hover:text-on-surface"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            {tournaments.map((event) => (
              <article
                key={event.name}
                className="motion-card overflow-hidden rounded-xl bg-surface-low shadow-ambient outline outline-1 outline-white/10 hover:bg-surface-high hover:outline-primary/30"
              >
                <div className="grid gap-0 sm:grid-cols-[150px_1fr]">
                  <div className="flex min-h-36 flex-col justify-between bg-[linear-gradient(160deg,#91c53a,#384f14)] p-4 text-background">
                    <span className="w-fit rounded-full bg-black/18 px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.12em]">
                      {event.accent}
                    </span>
                    <div>
                      <p className="font-headline text-4xl font-black leading-none">{event.date.split(" ")[1]}</p>
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em]">{event.date.split(" ")[0]}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">{event.status}</p>
                        <h2 className="mt-2 font-headline text-2xl font-black leading-tight text-on-surface sm:text-3xl">
                          {event.name}
                        </h2>
                      </div>
                      <span className="rounded-full bg-secondary/12 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-secondary">
                        {event.level}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        [CalendarDays, event.date],
                        [MapPin, event.venue],
                        [UsersRound, event.players]
                      ].map(([Icon, text]) => (
                        <div key={String(text)} className="rounded-lg bg-black/45 p-3 outline outline-1 outline-white/10">
                          <Icon className="h-4 w-4 text-secondary" aria-hidden="true" />
                          <p className="mt-2 text-sm font-bold text-on-surface">{String(text)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
                          Registration
                        </p>
                        <p className="text-xs font-black text-secondary">{event.progress}</p>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-primary" style={{ width: event.progress }} />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-5">
            <div className="rounded-xl bg-surface-low p-5 shadow-ambient outline outline-1 outline-white/10 sm:p-6">
              <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Organizer suite
              </p>
              <h2 className="mt-3 font-headline text-3xl font-black text-on-surface">Make every event feel official.</h2>
              <div className="mt-5 grid gap-3">
                {[
                  [ShieldCheck, "Verified hosts", "Publish events only after organizer approval."],
                  [Medal, "Clean divisions", "Open, beginner, intermediate, advanced, and doubles categories."],
                  [CheckCircle2, "Registration ready", "Player counts, venue details, deadlines, and status badges."]
                ].map(([Icon, title, text]) => (
                  <div key={String(title)} className="rounded-lg bg-black/45 p-4 outline outline-1 outline-white/10">
                    <Icon className="h-5 w-5 text-secondary" aria-hidden="true" />
                    <p className="mt-3 font-bold text-on-surface">{String(title)}</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-on-surface-variant">{String(text)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-primary p-5 text-background shadow-glow sm:p-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em]">Host spotlight</p>
              <h2 className="mt-2 font-headline text-3xl font-black">Run a polished bracket tonight.</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-background/75">
                Create the event, add divisions, publish details, and send players into a matchday page that behaves
                like it has a clipboard and excellent posture.
              </p>
              <Link
                href="/host/register"
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-background px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-primary"
              >
                Register host
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
