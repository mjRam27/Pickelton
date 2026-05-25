import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarCheck,
  ChevronRight,
  Clock3,
  Crown,
  MapPin,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  UsersRound
} from "lucide-react";
import { AppNav } from "@/components/app/AppNav";

const heroStats = [
  ["24", "Live courts"],
  ["128", "Players queued"],
  ["12", "Clubs active"]
];

const featureCards = [
  {
    href: "/scoring",
    title: "Live Scoring",
    text: "Run matches with clean score controls, serving status, set history, and match momentum.",
    icon: Swords
  },
  {
    href: "/tournaments",
    title: "Tournaments",
    text: "Browse featured events, view brackets, track registrations, and create new tournament drafts.",
    icon: Trophy
  },
  {
    href: "/clubs",
    title: "Clubs",
    text: "Discover local clubs, compare courts, coaching, events, and community activity.",
    icon: Building2
  }
];

const schedule = [
  ["06:30 AM", "Morning ladder", "Indiranagar Arena"],
  ["05:00 PM", "Mixed doubles", "Whitefield Pickle Hub"],
  ["08:15 PM", "Club finals", "Koramangala Court House"]
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 pt-6 sm:px-8 sm:pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-0">
        <div className="float-in">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-on-surface-variant outline outline-1 outline-white/10 sm:px-4 sm:text-xs sm:tracking-[0.16em]">
            <Crown className="h-4 w-4 text-secondary" aria-hidden="true" />
            Premium pickleball operations
          </p>
          <h1 className="mt-5 max-w-4xl font-headline text-4xl font-black leading-[0.98] text-on-surface sm:mt-6 sm:text-7xl sm:leading-[0.94]">
            The elegant way to run matchday.
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-on-surface-variant sm:mt-6 sm:text-lg sm:leading-7">
            Pickelton brings live scoring, tournaments, court booking, and club discovery into one refined experience
            for players, organizers, and premium sports venues.
          </p>
          <div className="mt-6 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
            <Link
              href="/tournaments"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-background"
            >
              Explore events
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/scoring"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white/8 px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-on-surface outline outline-1 outline-white/10"
            >
              Open scorer
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid max-w-2xl grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
            {heroStats.map(([value, label]) => (
              <div key={label} className="rounded-lg bg-white/[0.04] p-3 outline outline-1 outline-white/10 sm:p-4">
                <p className="font-headline text-2xl font-black text-on-surface sm:text-3xl">{value}</p>
                <p className="mt-1 text-[0.7rem] font-bold leading-4 text-on-surface-variant sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-surface-low p-3 shadow-ambient outline outline-1 outline-white/10 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-black/35 px-4 py-3 outline outline-1 outline-white/10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-secondary">Live showcase</p>
              <p className="mt-1 font-headline text-lg font-black text-on-surface sm:text-xl">City Finals Court</p>
            </div>
            <span className="live-pulse rounded-full bg-secondary/12 px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-secondary">
              On air
            </span>
          </div>
          <div className="rounded-lg bg-surface-high p-3 shadow-ambient outline outline-1 outline-white/10 sm:p-4">
            <div className="relative aspect-[5/4] overflow-hidden rounded-lg bg-[#6f9f28] p-4 sm:aspect-[4/5]">
              <div className="absolute inset-4 rounded border-2 border-white/80" />
              <div className="absolute left-1/2 top-4 h-[calc(100%-2rem)] w-0.5 -translate-x-1/2 bg-white/80" />
              <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-white/80" />
              <div className="absolute left-4 right-4 top-[28%] h-0.5 bg-white/70" />
              <div className="absolute left-4 right-4 bottom-[28%] h-0.5 bg-white/70" />
              <div className="absolute left-[8%] top-[12%] rounded-lg bg-black/65 p-3 outline outline-1 outline-white/15 sm:left-[10%] sm:top-[14%] sm:p-4">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-secondary">Falcons</p>
                <p className="mt-1 font-headline text-3xl font-black text-on-surface sm:text-4xl">11</p>
                <p className="text-xs font-bold text-on-surface-variant">Serving</p>
              </div>
              <div className="absolute bottom-[12%] right-[8%] rounded-lg bg-primary/90 p-3 text-background sm:bottom-[14%] sm:right-[10%] sm:p-4">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em]">Smashers</p>
                <p className="mt-1 font-headline text-3xl font-black sm:text-4xl">8</p>
                <p className="text-xs font-black">Set point</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-8 sm:pb-14 lg:px-0">
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map(({ href, title, text, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="motion-card rounded-xl bg-surface-low p-4 shadow-ambient outline outline-1 outline-white/10 hover:bg-surface-high hover:outline-white/20 sm:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/8 text-secondary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-on-surface-variant" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-headline text-xl font-black text-on-surface sm:mt-5 sm:text-2xl">{title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-on-surface-variant">{text}</p>
            </Link>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:mt-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-xl bg-surface-low p-5 shadow-ambient outline outline-1 outline-white/10 sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Tonight</p>
            <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">Court schedule</h2>
            <div className="mt-5 space-y-3">
              {schedule.map(([time, match, venue]) => (
                <div key={`${time}-${match}`} className="grid gap-3 rounded-lg bg-black/45 p-4 outline outline-1 outline-white/10 sm:grid-cols-[auto_1fr] sm:items-center">
                  <span className="inline-flex h-12 w-24 items-center justify-center rounded-lg bg-primary/12 text-sm font-black text-primary">
                    {time}
                  </span>
                  <div>
                    <p className="font-headline text-xl font-black text-on-surface">{match}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      {venue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-surface-low p-5 shadow-ambient outline outline-1 outline-white/10 sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Built for every role</p>
            <h2 className="mt-2 font-headline text-3xl font-black text-on-surface">A complete matchday flow</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                [CalendarCheck, "Book courts", "Reserve slots with clear venue and timing details."],
                [RadioTower, "Run live scores", "Keep the audience and players aligned point by point."],
                [Trophy, "Host events", "Create polished tournament pages and registration flows."],
                [UsersRound, "Build clubs", "Showcase local communities, members, and coaching."],
                [ShieldCheck, "Verify hosts", "Keep organizer workflows trustworthy and controlled."],
                [Clock3, "Track activity", "Make schedules, deadlines, and next actions easy to scan."]
              ].map(([Icon, title, text]) => (
                <div key={String(title)} className="rounded-lg bg-black/45 p-4 outline outline-1 outline-white/10">
                  <Icon className="h-5 w-5 text-secondary" aria-hidden="true" />
                  <p className="mt-3 font-bold text-on-surface">{String(title)}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-on-surface-variant">{String(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
