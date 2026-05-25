"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  Camera,
  Clock3,
  Crown,
  Flag,
  MapPin,
  Minus,
  Plus,
  RadioTower,
  Radio,
  RotateCcw,
  Shield,
  Swords,
  TimerReset,
  Trophy,
  Undo2
} from "lucide-react";
import { AppNav } from "@/components/app/AppNav";

type Point = "home" | "away";
type CommentaryEntry = {
  id: number;
  team: Point;
  scoreline: string;
  text: string;
};

const tossDetails = {
  winner: "Falcons",
  choice: "Serve first",
  firstServer: "Aarav Mehta",
  side: "North baseline",
  called: "Heads",
  result: "Heads"
};

const players = {
  home: ["Aarav Mehta", "Rohan Iyer"],
  away: ["Kabir Rao", "Neil D'Souza"]
};

const openingCommentary: CommentaryEntry[] = [
  {
    id: 5,
    team: "home",
    scoreline: "7 - 5",
    text: "Falcons stretch the lead with a composed rally finish. Very calm, very expensive-looking."
  },
  {
    id: 4,
    team: "away",
    scoreline: "6 - 5",
    text: "Smashers stay close and keep the pressure alive. This match is refusing to sit politely."
  },
  {
    id: 3,
    team: "home",
    scoreline: "6 - 4",
    text: "Falcons find the open court and take control of the exchange. Neat, tidy, slightly rude."
  }
];

const commentaryLines = {
  home: [
    "Falcons take the point with a sharp finish at the kitchen line. The paddle had a plan.",
    "Falcons push the tempo and force the error. That rally needed a seatbelt.",
    "Clean placement from Falcons, and the scoreboard moves again with excellent manners.",
    "Falcons hold their nerve through the rally. Ice in the veins, spin on the ball."
  ],
  away: [
    "Smashers answer back under pressure. Quiet confidence, loud scoreboard.",
    "Smashers read the angle early and turn defense into a point. Very chess, but faster.",
    "A crisp exchange from Smashers narrows the gap on court A1. The plot thickens nicely.",
    "Smashers stay patient, wait for the opening, and make it count. Polite until the finish."
  ]
};

export default function ScoringPage() {
  const [homeScore, setHomeScore] = useState(7);
  const [awayScore, setAwayScore] = useState(5);
  const [server, setServer] = useState<Point>("home");
  const [history, setHistory] = useState<Point[]>(["home", "away", "home", "home", "away"]);
  const [commentary, setCommentary] = useState<CommentaryEntry[]>(openingCommentary);

  const leader = useMemo(() => {
    if (homeScore === awayScore) return "Level game";
    return homeScore > awayScore ? "Falcons lead" : "Smashers lead";
  }, [homeScore, awayScore]);

  const scoreGap = Math.abs(homeScore - awayScore);
  const matchPoint = homeScore >= 10 || awayScore >= 10;

  function addPoint(team: Point) {
    const nextHomeScore = homeScore + (team === "home" ? 1 : 0);
    const nextAwayScore = awayScore + (team === "away" ? 1 : 0);
    const nextPointNumber = history.length + 1;
    const lineSet = commentaryLines[team];
    const text = lineSet[nextPointNumber % lineSet.length];

    if (team === "home") setHomeScore((score) => score + 1);
    if (team === "away") setAwayScore((score) => score + 1);
    setServer(team);
    setHistory((items) => [team, ...items].slice(0, 8));
    setCommentary((items) =>
      [
        {
          id: Date.now(),
          team,
          scoreline: `${nextHomeScore} - ${nextAwayScore}`,
          text
        },
        ...items
      ].slice(0, 6)
    );
  }

  function subtractPoint(team: Point) {
    if (team === "home") setHomeScore((score) => Math.max(0, score - 1));
    if (team === "away") setAwayScore((score) => Math.max(0, score - 1));
  }

  function resetMatch() {
    setHomeScore(0);
    setAwayScore(0);
    setServer("home");
    setHistory([]);
    setCommentary([
      {
        id: Date.now(),
        team: "home",
        scoreline: "0 - 0",
        text: "Match reset. Falcons prepare to serve first after the toss decision."
      }
    ]);
  }

  function undoLast() {
    const [last, ...rest] = history;
    if (!last) return;
    subtractPoint(last);
    setHistory(rest);
    setCommentary((items) => items.slice(1));
  }

  return (
    <main className="kinetic-grid min-h-screen">
      <AppNav />
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-8 lg:px-0">
        <div className="mb-5 grid gap-3 rounded-xl bg-surface-low p-4 shadow-ambient outline outline-1 outline-white/10 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-on-secondary">
              <RadioTower className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Championship court A1</p>
              <h1 className="mt-1 font-headline text-3xl font-black leading-tight text-on-surface sm:text-4xl">
                Falcons vs Smashers
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary/12 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-secondary outline outline-1 outline-secondary/25">
              Toss: {tossDetails.winner} won and chose to serve
            </span>
            {["Set 1", "Best of 3", "Target 11"].map((item) => (
              <span
                key={item}
                className="rounded-full bg-white/8 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-on-surface-variant outline outline-1 outline-white/10"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-[#101111] shadow-ambient outline outline-1 outline-white/10">
          <div className="grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="bg-[linear-gradient(160deg,rgba(35,37,36,0.98),rgba(7,8,8,0.96))] p-5 sm:p-7">
              <div className="rounded-xl bg-black/35 p-5 outline outline-1 outline-white/10">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-secondary">Match control</p>
                <h2 className="mt-3 font-headline text-4xl font-black leading-tight text-on-surface">
                  Live scoring, toss, and serve flow.
                </h2>
                <p className="mt-4 text-sm font-semibold leading-6 text-on-surface-variant">
                  A refined courtside console for tournament officials with clear pre-match decisions and point-by-point
                  scoring.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  [MapPin, "Court A1", "Indiranagar"],
                  [Clock3, "18:45", "Start time"],
                  [Shield, "Best of 3", "Game format"]
                ].map(([Icon, value, label]) => (
                  <div key={String(label)} className="rounded-lg bg-black/45 p-4 outline outline-1 outline-white/10">
                    <Icon className="h-5 w-5 text-secondary" aria-hidden="true" />
                    <p className="mt-3 font-headline text-xl font-black text-on-surface">{String(value)}</p>
                    <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.12em] text-on-surface-variant">
                      {String(label)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl bg-surface-low p-5 outline outline-1 outline-secondary/20">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-secondary">
                      <Flag className="h-4 w-4" aria-hidden="true" />
                      Toss decision
                    </p>
                    <h2 className="mt-2 font-headline text-2xl font-black text-on-surface">
                      {tossDetails.winner} won the toss
                    </h2>
                  </div>
                  <span className="rounded-full bg-secondary/12 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-secondary">
                    {tossDetails.choice}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Call", tossDetails.called],
                    ["Result", tossDetails.result],
                    ["First server", tossDetails.firstServer],
                    ["Starting side", tossDetails.side]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white/[0.04] p-4 outline outline-1 outline-white/10">
                      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-black text-on-surface">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-surface p-3 outline outline-1 outline-white/10">
                <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div className="rounded-lg bg-secondary/12 p-3 outline outline-1 outline-secondary/20">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-secondary">
                      Falcons
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-on-surface">{players.home[0]}</p>
                        <p className="truncate text-sm font-black text-on-surface">{players.home[1]}</p>
                      </div>
                      <p className="font-headline text-4xl font-black leading-none text-on-surface">{homeScore}</p>
                    </div>
                  </div>
                  <span className="hidden rounded-full bg-white/8 px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-on-surface-variant outline outline-1 outline-white/10 sm:inline-flex">
                    Court view
                  </span>
                  <div className="rounded-lg bg-primary/12 p-3 outline outline-1 outline-primary/20">
                    <p className="text-right text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-primary">
                      Smashers
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <p className="font-headline text-4xl font-black leading-none text-on-surface">{awayScore}</p>
                      <div className="min-w-0 text-right">
                        <p className="truncate text-sm font-black text-on-surface">{players.away[0]}</p>
                        <p className="truncate text-sm font-black text-on-surface">{players.away[1]}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#6f9f28] shadow-ambient">
                  <div className="absolute inset-4 rounded border-2 border-white/80" />
                  <div className="absolute left-1/2 top-4 h-[calc(100%-2rem)] w-0.5 -translate-x-1/2 bg-white/80" />
                  <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-white/80" />
                  <div className="absolute left-4 right-4 top-[26%] h-0.5 bg-white/55" />
                  <div className="absolute bottom-[26%] left-4 right-4 h-0.5 bg-white/55" />
                  <div className="absolute bottom-6 left-6 rounded-lg bg-black/55 px-4 py-3 outline outline-1 outline-white/15">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-secondary">Serving</p>
                    <p className="mt-1 font-headline text-2xl font-black text-on-surface">
                      {server === "home" ? "Falcons" : "Smashers"}
                    </p>
                  </div>
                  <div className="absolute left-6 top-6 rounded-lg bg-black/55 px-4 py-3 outline outline-1 outline-white/15">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-primary">Toss</p>
                    <p className="mt-1 text-sm font-black text-on-surface">
                      {tossDetails.winner}: {tossDetails.choice}
                    </p>
                  </div>
                  <div className="absolute right-6 top-6 rounded-lg bg-primary/90 px-4 py-3 text-background">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em]">Gap</p>
                    <p className="mt-1 font-headline text-2xl font-black">{scoreGap}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl bg-black/45 outline outline-1 outline-white/10">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                  <div>
                    <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-secondary">
                      <Camera className="h-4 w-4" aria-hidden="true" />
                      Live video
                    </p>
                    <p className="mt-1 text-sm font-bold text-on-surface-variant">Broadcast-ready match feed</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-error/14 px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-error">
                    <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                    Offline demo
                  </span>
                </div>
                <div className="relative aspect-video bg-[#0b0d0c]">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(184,246,0,0.12),transparent_34%),linear-gradient(315deg,rgba(149,170,255,0.14),transparent_38%)]" />
                  <div className="absolute inset-4 rounded-lg border border-white/10" />
                  <div className="absolute left-4 top-4 rounded-lg bg-black/55 px-3 py-2 outline outline-1 outline-white/10">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-secondary">
                      Feed slot
                    </p>
                    <p className="mt-1 text-sm font-black text-on-surface">Camera / RTMP / WebRTC stream</p>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/65 p-3 outline outline-1 outline-white/10">
                    <p className="text-sm font-bold leading-6 text-on-surface">
                      Add a real stream URL later and this panel can host the live court broadcast inside the app.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-[linear-gradient(180deg,#102019,#07100c)] p-4 sm:p-6 lg:border-l lg:border-t-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Official scoreboard</p>
                  <h2 className="mt-2 font-headline text-2xl font-black text-on-surface">Referee scoring panel</h2>
                </div>
                <span className={`live-pulse rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] ${
                  matchPoint ? "bg-error/14 text-error" : "bg-secondary/12 text-secondary"
                }`}>
                  {matchPoint ? "Match point zone" : leader}
                </span>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl bg-black/55 outline outline-1 outline-white/10">
                <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
                  <div className="min-w-0 p-5 text-left sm:p-6">
                    <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-secondary">
                      {server === "home" ? <BadgeCheck className="h-4 w-4" aria-hidden="true" /> : null}
                      Falcons
                    </p>
                    <p className="mt-3 font-headline text-7xl font-black leading-none text-on-surface sm:text-8xl">
                      {homeScore}
                    </p>
                  </div>
                  <div className="flex min-h-full flex-col items-center justify-center gap-3 border-x border-white/10 bg-white/[0.03] px-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary/12 text-secondary outline outline-1 outline-secondary/20">
                      <Swords className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-on-surface-variant">
                      Set 1
                    </span>
                  </div>
                  <div className="min-w-0 p-5 text-right sm:p-6">
                    <p className="inline-flex items-center justify-end gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                      Smashers
                      {server === "away" ? <BadgeCheck className="h-4 w-4" aria-hidden="true" /> : null}
                    </p>
                    <p className="mt-3 font-headline text-7xl font-black leading-none text-on-surface sm:text-8xl">
                      {awayScore}
                    </p>
                  </div>
                </div>
                <div className="grid border-t border-white/10 bg-white/[0.03] sm:grid-cols-3">
                  {[
                    ["Server", server === "home" ? "Falcons" : "Smashers"],
                    ["Score gap", String(scoreGap)],
                    ["Status", matchPoint ? "Match point" : leader]
                  ].map(([label, value]) => (
                    <div key={label} className="border-white/10 p-4 sm:border-r last:border-r-0">
                      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
                        {label}
                      </p>
                      <p className="mt-1 font-headline text-xl font-black text-on-surface">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl bg-surface outline outline-1 outline-secondary/20">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-secondary/10 px-4 py-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-secondary">
                      Live commentary
                    </p>
                    <h3 className="mt-1 font-headline text-xl font-black text-on-surface">Courtside broadcast</h3>
                  </div>
                  <span className="rounded-full bg-black/35 px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-secondary outline outline-1 outline-secondary/20">
                    Auto-updates after every point
                  </span>
                </div>
                <div className="grid max-h-72 gap-3 overflow-y-auto p-4">
                  {commentary.map((item, index) => (
                    <div
                      key={item.id}
                      className={`rounded-lg p-4 outline outline-1 ${
                        index === 0
                          ? "bg-white/[0.08] outline-secondary/30"
                          : "bg-black/35 outline-white/10"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] ${
                            item.team === "home"
                              ? "bg-secondary/12 text-secondary"
                              : "bg-primary/12 text-primary"
                          }`}
                        >
                          {item.team === "home" ? "Falcons" : "Smashers"}
                        </span>
                        <span className="font-headline text-lg font-black text-on-surface">{item.scoreline}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold leading-6 text-on-surface-variant">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  { key: "home" as Point, name: "Falcons", score: homeScore, tone: "secondary" },
                  { key: "away" as Point, name: "Smashers", score: awayScore, tone: "primary" }
                ].map((team) => {
                  const isSecondary = team.tone === "secondary";
                  return (
                    <div
                      key={team.key}
                      className={`rounded-xl p-5 outline outline-1 ${
                        server === team.key
                          ? "bg-white/[0.07] outline-secondary/40 shadow-glow"
                          : "bg-black/35 outline-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-on-surface-variant">
                            {server === team.key ? "Serving now" : "Ready"}
                          </p>
                          <h3 className="mt-2 font-headline text-2xl font-black text-on-surface">{team.name}</h3>
                        </div>
                        <span
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${
                            isSecondary ? "bg-secondary text-on-secondary" : "bg-primary text-background"
                          }`}
                        >
                          {homeScore === awayScore || team.score < Math.max(homeScore, awayScore) ? (
                            <Trophy className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <Crown className="h-5 w-5" aria-hidden="true" />
                          )}
                        </span>
                      </div>
                      <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                        <button
                          type="button"
                          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-extrabold uppercase tracking-[0.08em] ${
                            isSecondary ? "bg-secondary text-on-secondary" : "bg-primary text-background"
                          }`}
                          onClick={() => addPoint(team.key)}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                          Point
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/8 text-on-surface outline outline-1 outline-white/10 transition hover:bg-white/12"
                          aria-label={`Remove point from ${team.name}`}
                          onClick={() => subtractPoint(team.key)}
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
                <div className="rounded-lg bg-black/45 p-4 outline outline-1 outline-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
                      Rally timeline
                    </p>
                    <Activity className="h-4 w-4 text-secondary" aria-hidden="true" />
                  </div>
                  <div className="mt-4 grid gap-2">
                    {history.length ? (
                      history.map((team, index) => (
                        <div
                          key={`${team}-${index}`}
                          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2"
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              team === "home" ? "bg-secondary" : "bg-primary"
                            }`}
                          />
                          <span className="text-sm font-bold text-on-surface">
                            {team === "home" ? "Falcons point" : "Smashers point"}
                          </span>
                          <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-on-surface-variant">
                            R{history.length - index}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm font-semibold text-on-surface-variant">No rallies yet.</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 xl:w-64">
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white/8 px-4 text-sm font-extrabold uppercase tracking-[0.08em] text-on-surface outline outline-1 outline-white/10 transition hover:bg-white/12"
                    onClick={undoLast}
                  >
                    <Undo2 className="h-4 w-4" aria-hidden="true" />
                    Undo
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-error/14 px-4 text-sm font-extrabold uppercase tracking-[0.08em] text-error outline outline-1 outline-error/20 transition hover:bg-error/20"
                    onClick={resetMatch}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Reset
                  </button>
                  <div className="col-span-2 rounded-lg bg-primary/10 p-4 outline outline-1 outline-primary/20">
                    <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                      <TimerReset className="h-4 w-4" aria-hidden="true" />
                      Match note
                    </p>
                    <p className="mt-2 text-sm font-bold leading-6 text-on-surface">
                      {matchPoint
                        ? "One point can decide the set. Keep the serving call clear."
                        : `${leader}. First to 11 wins with a two-point margin.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Set score", "0 - 0", "Current match is in the opening set."],
            ["Momentum", server === "home" ? "Falcons" : "Smashers", "Last rally winner controls the serve."],
            ["Toss choice", tossDetails.choice, `${tossDetails.winner} starts from ${tossDetails.side}.`]
          ].map(([title, value, text]) => (
            <div key={title} className="rounded-xl bg-surface-low p-5 shadow-ambient outline outline-1 outline-white/10">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">{title}</p>
              <p className="mt-2 font-headline text-3xl font-black text-on-surface">{value}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-on-surface-variant">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
