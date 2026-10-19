// web/app/(app)/tournaments/[id]/matches/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Play, Plus, Trophy, X } from "lucide-react";
import { rulesets } from "@pickelton/constants";
import type { Match, MatchParticipantRequest, TournamentParticipant, TournamentType } from "@pickelton/types";
import { ConfirmDialog, Empty, LoadError, Loading, Notice, PageHeader, Segmented, Spinner } from "../../../../../components/ui";
import { api, errorMessage, useResource, useSession } from "../../../../../lib/session";

const STATUS: Record<string, { label: string; cls: string }> = {
  COMPLETED: { label: "Final", cls: "badge acc" },
  LIVE: { label: "Live", cls: "badge hot" },
  CANCELLED: { label: "Cancelled", cls: "badge plain" },
};
const NO_CATEGORY = "NONE";

const side = (match: Match, team: "A" | "B") =>
  match.participants.filter((person) => person.role === "PLAYER" && person.team === team).map((person) => person.name).join(" / ") || `Team ${team}`;
const score = (match: Match, team: "A" | "B") => (typeof match.currentScore?.[team] === "number" ? (match.currentScore[team] as number) : 0);

// Matches of an event, per category. The host creates matches between registered players and scores them live
// or enters the final score; completed matches feed the leaderboard.
export default function TournamentMatchesPage() {
  const { id } = useParams<{ id: string }>();
  const session = useSession();
  const [categoryId, setCategoryId] = useState("");
  const { data, setData, error, loading, reload } = useResource(async () => {
    const [event, participants, matches] = await Promise.all([
      api.tournaments.get(id), api.tournaments.participants(id), api.matches.forTournament(id),
    ]);
    return { event, participants, matches };
  }, [id]);

  if (loading && !data) return <Loading label="Loading matches" />;
  if (!data) return <LoadError message={error} onRetry={reload} />;
  const { event, participants, matches } = data;
  const isHost = session?.userId === event.createdBy.id;
  const categories = event.categories ?? [];
  const current = categories.find((category) => category.id === categoryId) ?? categories[0] ?? null;
  const format: TournamentType = current?.format ?? event.tournamentType;
  const players = current ? participants.filter((person) => person.categoryIds?.includes(current.id)) : participants;
  const shown = matches
    .filter((match) => (current ? match.categoryId === current.id : true))
    .sort((a, b) => Number(a.status === "COMPLETED") - Number(b.status === "COMPLETED"));
  const closed = event.status === "FINISHED" || event.status === "CANCELLED";

  function replace(updated: Match) {
    setData((existing) => existing && { ...existing, matches: existing.matches.map((match) => (match.id === updated.id ? updated : match)) });
  }

  return (
    <>
      <PageHeader
        crumbs={<><Link href="/tournaments">Events</Link><span aria-hidden="true">/</span><Link href={`/tournaments/${id}`}>{event.name}</Link><span aria-hidden="true">/</span><span>Matches</span></>}
        sub={isHost ? "Set up matches between registered players, then score them live or enter the final score." : "Match results for this event."}
        title="Matches"
      >
        <Link className="btn" href={`/tournaments/${id}/leaderboard`}><Trophy aria-hidden="true" size={18} />Leaderboard</Link>
      </PageHeader>

      {categories.length ? (
        <div style={{ overflowX: "auto" }}>
          <Segmented label="Category" onChange={setCategoryId} options={categories.map((category) => ({ label: category.name, value: category.id }))} value={current?.id ?? ""} />
        </div>
      ) : null}

      {isHost && !closed ? (
        <NewMatch
          categoryId={current?.id ?? NO_CATEGORY}
          format={format}
          key={current?.id ?? NO_CATEGORY}
          onCreated={(match) => setData((existing) => existing && { ...existing, matches: [...existing.matches, match] })}
          players={players}
          sport={event.sportType === "BADMINTON" ? "BADMINTON" : "PICKLEBALL"}
          tournamentId={id}
        />
      ) : null}

      {shown.length ? (
        <div className="vstack">
          {shown.map((match) => <MatchCard isHost={isHost} key={match.id} match={match} onChanged={replace} />)}
        </div>
      ) : (
        <Empty
          copy={isHost ? (players.length < (format === "DOUBLES" ? 4 : 2) ? "Matches can be set up once enough players have registered here." : "Create the first match above.") : "Matches appear here once the host sets them up."}
          title="No matches yet"
        />
      )}
    </>
  );
}

function NewMatch({ tournamentId, categoryId, format, sport, players, onCreated }: {
  tournamentId: string;
  categoryId: string;
  format: TournamentType;
  sport: "PICKLEBALL" | "BADMINTON";
  players: TournamentParticipant[];
  onCreated: (match: Match) => void;
}) {
  const perSide = format === "DOUBLES" ? 2 : 1;
  const [slots, setSlots] = useState<string[]>(Array(perSide * 2).fill(""));
  const [round, setRound] = useState("Round 1");
  const [court, setCourt] = useState("");
  const [pointsPerSet, setPointsPerSet] = useState(rulesets[sport].pointsToWin);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const enough = players.length >= perSide * 2;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (slots.some((slot) => !slot)) return setError(perSide === 2 ? "Pick two players for each side." : "Pick a player for each side.");
    if (new Set(slots).size !== slots.length) return setError("Each player can only be on court once in a match.");
    if (!round.trim()) return setError("Give the match a round, like Round 1 or Final.");
    const participants: MatchParticipantRequest[] = slots.map((userId, index) => ({ userId, team: index < perSide ? "A" : "B", role: "PLAYER" }));
    setSaving(true);
    try {
      const match = await api.matches.create({
        mode: "TOURNAMENT", tournamentId, categoryId: categoryId === NO_CATEGORY ? null : categoryId,
        player1Id: slots[0], player2Id: slots[perSide], participants, scorerId: null, refereeId: null,
        sport, matchType: format, scheduledAt: null, location: court.trim() || null,
        rules: { pointsPerSet, bestOfSets: 1, winByTwo: true }, round: round.trim(),
      });
      onCreated(match);
      setSlots(Array(perSide * 2).fill(""));
      setOpen(false);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button className="btn primary" disabled={!enough} onClick={() => setOpen(true)} style={{ alignSelf: "flex-start" }} type="button">
        <Plus aria-hidden="true" size={18} />New match
      </button>
    );
  }

  const picker = (index: number, label: string) => (
    <div className="field" key={index}>
      <label htmlFor={`slot-${index}`}>{label}</label>
      <select className="input" id={`slot-${index}`} onChange={(event) => setSlots((current) => current.map((value, i) => (i === index ? event.target.value : value)))} value={slots[index]}>
        <option value="">Choose a player</option>
        {players.map((person) => (
          <option disabled={slots.includes(person.userId) && slots[index] !== person.userId} key={person.userId} value={person.userId}>{person.name}</option>
        ))}
      </select>
    </div>
  );

  return (
    <form className="card" onSubmit={submit}>
      <h2>New {format === "DOUBLES" ? "doubles" : "singles"} match</h2>
      <div className="formGrid">
        <div className="vstack" style={{ gap: 8 }}>
          <span className="fieldLabel">Side A</span>
          {Array.from({ length: perSide }, (_, i) => picker(i, perSide === 2 ? `Player ${i + 1}` : "Player"))}
        </div>
        <div className="vstack" style={{ gap: 8 }}>
          <span className="fieldLabel">Side B</span>
          {Array.from({ length: perSide }, (_, i) => picker(perSide + i, perSide === 2 ? `Player ${i + 1}` : "Player"))}
        </div>
      </div>
      <div className="formGrid">
        <div className="field"><label htmlFor="nm-round">Round</label><input className="input" id="nm-round" maxLength={50} onChange={(event) => setRound(event.target.value)} value={round} /></div>
        <div className="field"><label htmlFor="nm-court">Court (optional)</label><input className="input" id="nm-court" maxLength={255} onChange={(event) => setCourt(event.target.value)} placeholder="Court 2" value={court} /></div>
        <div className="field">
          <label htmlFor="nm-points">Game to</label>
          <select className="input" id="nm-points" onChange={(event) => setPointsPerSet(Number(event.target.value))} value={pointsPerSet}>
            {rulesets[sport].pointOptions.map((points) => <option key={points} value={points}>{points} points, win by 2</option>)}
          </select>
        </div>
      </div>
      <Notice message={error} />
      <div className="row">
        <button className="btn primary" disabled={saving} type="submit">{saving ? <Spinner /> : <Plus aria-hidden="true" size={18} />}Create match</button>
        <button className="btn" onClick={() => setOpen(false)} type="button">Close</button>
      </div>
    </form>
  );
}

function MatchCard({ match, isHost, onChanged }: { match: Match; isHost: boolean; onChanged: (match: Match) => void }) {
  const [entering, setEntering] = useState(false);
  const [scores, setScores] = useState<[string, string]>(["", ""]);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState("");
  const done = match.status === "COMPLETED" || match.status === "CANCELLED";
  const status = STATUS[match.status] ?? { label: "Not started", cls: "badge outline" };
  const [a, b] = [score(match, "A"), score(match, "B")];
  const winner = match.status === "COMPLETED" ? (a > b ? "A" : b > a ? "B" : null) : null;

  async function saveResult(event: FormEvent) {
    event.preventDefault();
    const [scoreA, scoreB] = scores.map(Number);
    if (!scores.every((value) => value !== "" && Number.isInteger(Number(value)) && Number(value) >= 0)) return setError("Enter both scores as whole numbers.");
    if (scoreA === scoreB) return setError("Scores can't be level; one side has to win.");
    setBusy(true);
    setError("");
    try {
      await api.matches.enterResult(match.id, scoreA, scoreB);
      onChanged({ ...match, status: "COMPLETED", currentScore: { ...match.currentScore, A: scoreA, B: scoreB } });
      setEntering(false);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setConfirmCancel(false);
    setBusy(true);
    setError("");
    try {
      onChanged(await api.matches.cancel(match.id));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card" style={{ gap: 10 }}>
      <div className="row between">
        <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>{match.round}{match.location ? ` · ${match.location}` : ""}</span>
        <span className={status.cls}>{status.label}</span>
      </div>
      {(["A", "B"] as const).map((team) => (
        <div className="row between" key={team} style={{ flexWrap: "nowrap" }}>
          <strong style={{ color: winner === team ? "var(--acc-ink)" : winner ? "var(--muted)" : undefined, minWidth: 0 }}>{side(match, team)}</strong>
          {match.status !== "CANCELLED" && (match.status !== "CREATED" || a + b > 0) ? <span className="display" style={{ fontSize: 26 }}>{team === "A" ? a : b}</span> : null}
        </div>
      ))}
      {entering ? (
        <form className="row" onSubmit={saveResult} style={{ alignItems: "flex-end" }}>
          <div className="field" style={{ flex: "1 1 90px" }}><label htmlFor={`${match.id}-a`}>{side(match, "A")}</label><input className="input" id={`${match.id}-a`} inputMode="numeric" min={0} onChange={(event) => setScores([event.target.value, scores[1]])} type="number" value={scores[0]} /></div>
          <div className="field" style={{ flex: "1 1 90px" }}><label htmlFor={`${match.id}-b`}>{side(match, "B")}</label><input className="input" id={`${match.id}-b`} inputMode="numeric" min={0} onChange={(event) => setScores([scores[0], event.target.value])} type="number" value={scores[1]} /></div>
          <button className="btn primary" disabled={busy} type="submit">{busy ? <Spinner /> : <Check aria-hidden="true" size={16} />}Save result</button>
          <button className="btn" onClick={() => setEntering(false)} type="button">Close</button>
        </form>
      ) : (
        <div className="row" style={{ gap: 6 }}>
          {isHost && !done ? <Link className="btn small primary" href={`/matches/${match.id}?role=scorer`}><Play aria-hidden="true" size={16} />Score live</Link> : null}
          {isHost && !done ? <button className="btn small" onClick={() => { setEntering(true); setScores([a ? String(a) : "", b ? String(b) : ""]); }} type="button">Enter result</button> : null}
          {!isHost && match.status === "LIVE" ? <Link className="btn small" href={`/matches/${match.id}`}>Watch live</Link> : null}
          {isHost && !done ? <button className="btn small ghost" disabled={busy} onClick={() => setConfirmCancel(true)} style={{ color: "var(--muted)" }} type="button"><X aria-hidden="true" size={16} />Cancel</button> : null}
        </div>
      )}
      <Notice message={error} />
      <ConfirmDialog body="It won't count towards the leaderboard." confirmLabel="Cancel match" onCancel={() => setConfirmCancel(false)} onConfirm={cancel} open={confirmCancel} title="Cancel this match?" />
    </article>
  );
}
