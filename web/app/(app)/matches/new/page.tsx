// web/app/(app)/matches/new/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { rulesets } from "@pickelton/constants";
import type { MatchMode, MatchParticipantRequest, Tournament, UserSearchResult } from "@pickelton/types";
import { PlayerPicker } from "../../../../components/PlayerPicker";
import { Notice, PageHeader, Segmented, Spinner, Switch } from "../../../../components/ui";
import { api, errorMessage, useResource } from "../../../../lib/session";

type Sport = keyof typeof rulesets;
type Slot = UserSearchResult | null;

export default function NewMatchPage() {
  const router = useRouter();
  const { data: hosted } = useResource<Tournament[]>(() => api.tournaments.hosted().catch(() => []));
  const [sport, setSport] = useState<Sport>("PICKLEBALL");
  const [mode, setMode] = useState<MatchMode>("CASUAL");
  const [matchType, setMatchType] = useState<"SINGLES" | "DOUBLES">("DOUBLES");
  const [pointsPerSet, setPointsPerSet] = useState(rulesets.PICKLEBALL.pointsToWin);
  const [bestOfSets, setBestOfSets] = useState(3);
  const [winByTwo, setWinByTwo] = useState(true);
  const [tournamentId, setTournamentId] = useState("");
  const [round, setRound] = useState("Round 1");
  const [location, setLocation] = useState("");
  const [a1, setA1] = useState<Slot>(null);
  const [a2, setA2] = useState<Slot>(null);
  const [b1, setB1] = useState<Slot>(null);
  const [b2, setB2] = useState<Slot>(null);
  const [scorer, setScorer] = useState<Slot>(null);
  const [referee, setReferee] = useState<Slot>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const ruleset = rulesets[sport];

  const players = matchType === "SINGLES" ? [a1, b1] : [a1, a2, b1, b2];
  const pickedIds = (self: Slot) => [a1, a2, b1, b2].filter((player): player is UserSearchResult => Boolean(player) && player !== self).map((player) => player.userId);
  const playerIds = [a1, a2, b1, b2].filter((player): player is UserSearchResult => Boolean(player)).map((player) => player.userId);

  function chooseSport(next: Sport) {
    setSport(next);
    setPointsPerSet(rulesets[next].pointsToWin);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!round.trim()) return setError("Round is required.");
    if (mode === "TOURNAMENT" && !tournamentId) return setError("Choose one of your hosted tournaments.");
    if (players.some((player) => !player)) return setError(matchType === "SINGLES" ? "Pick one player for each side." : "Pick all four players for doubles.");
    const chosen = players as UserSearchResult[];
    if (new Set(chosen.map((player) => player.userId)).size !== chosen.length) return setError("Each player must be a different user.");
    if (scorer && chosen.some((player) => player.userId === scorer.userId)) return setError("The scorekeeper can't be one of the players.");

    const team = (slot: Slot, code: "A" | "B"): MatchParticipantRequest => ({ userId: slot!.userId, team: code, role: "PLAYER" });
    const participants = matchType === "SINGLES" ? [team(a1, "A"), team(b1, "B")] : [team(a1, "A"), team(a2, "A"), team(b1, "B"), team(b2, "B")];
    setSaving(true);
    try {
      const match = await api.matches.create({
        mode, tournamentId: mode === "TOURNAMENT" ? tournamentId : null, player1Id: a1!.userId, player2Id: b1!.userId, participants,
        scorerId: scorer?.userId ?? null, refereeId: referee?.userId ?? null, sport, matchType, scheduledAt: null,
        location: location.trim() || null, rules: { pointsPerSet, bestOfSets, winByTwo }, round: round.trim(),
      });
      const role = scorer ? "scorer" : referee ? "referee" : "viewer";
      router.replace(`/matches/${match.id}/ready?role=${role}`);
    } catch (cause) {
      setError(errorMessage(cause));
      setSaving(false);
    }
  }

  return (
    <form className="vstack" onSubmit={submit} style={{ gap: 20, maxWidth: 900 }}>
      <PageHeader sub="Set the sport, scoring and players, then send invites." title="New match">
        <Link className="btn" href="/home">Cancel</Link>
        <button className="btn primary" disabled={saving} type="submit">{saving ? <Spinner /> : null}Create &amp; send invites</button>
      </PageHeader>

      <section className="card">
        <span className="fieldLabel">Sport</span>
        <div className="formGrid">
          {(["PICKLEBALL", "BADMINTON"] as const).map((item) => (
            <button aria-pressed={sport === item} className={`choice ${item === "PICKLEBALL" ? "acc" : "blu"}`} key={item} onClick={() => chooseSport(item)} type="button">
              <strong>{item === "PICKLEBALL" ? "Pickleball" : "Badminton"}</strong>
              <small>{item === "PICKLEBALL" ? "Paddle · plastic ball" : "Racket · shuttlecock"}</small>
            </button>
          ))}
        </div>
        <div className="formGrid">
          <div className="field"><span className="fieldLabel">Match type</span><Segmented full label="Match type" onChange={setMode} options={[{ label: "Friendly", value: "CASUAL" }, { label: "Tournament", value: "TOURNAMENT" }]} value={mode} /></div>
          <div className="field"><span className="fieldLabel">Format</span><Segmented full label="Format" onChange={setMatchType} options={[{ label: "Singles", value: "SINGLES" }, { label: "Doubles", value: "DOUBLES" }]} value={matchType} /></div>
        </div>
        {mode === "TOURNAMENT" ? (
          <div className="field">
            <label htmlFor="nm-tournament">Your hosted tournament</label>
            <select className="input" id="nm-tournament" onChange={(event) => setTournamentId(event.target.value)} value={tournamentId}>
              <option value="">{hosted?.length ? "Choose a tournament" : "You aren't hosting any tournaments"}</option>
              {(hosted ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
        ) : null}
      </section>

      <section className="card">
        <h2>Scoring</h2>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(3, 1fr)" }}>
          {ruleset.pointOptions.map((points) => (
            <button aria-pressed={pointsPerSet === points} className="target" key={points} onClick={() => setPointsPerSet(points)} type="button"><strong>{points}</strong><small>points</small></button>
          ))}
        </div>
        <div className="row between">
          <Segmented label="Best of" onChange={(value) => setBestOfSets(Number(value))} options={["1", "3", "5"].map((value) => ({ label: `Best of ${value}`, value }))} value={String(bestOfSets)} />
          <span className="toggleRow" style={{ display: "flex", gap: 12 }}><strong style={{ fontSize: 14 }}>Win by 2{ruleset.pointCap ? ` (cap ${ruleset.pointCap})` : ""}</strong><Switch checked={winByTwo} label="Win by 2" onChange={setWinByTwo} /></span>
        </div>
        <span className="hint">{ruleset.scoring === "RALLY" ? "Rally scoring" : "Side-out scoring"} · {sport === "PICKLEBALL" ? "pickleball" : "badminton"} defaults</span>
      </section>

      <section className="card">
        <h2>Teams</h2>
        <div style={{ alignItems: "center", display: "grid", gap: 14, gridTemplateColumns: "1fr auto 1fr" }}>
          <div className="vstack" style={{ gap: 8 }}>
            <PlayerPicker excludeUserIds={pickedIds(a1)} label="Team A player" onSelect={setA1} value={a1} />
            {matchType === "DOUBLES" ? <PlayerPicker excludeUserIds={pickedIds(a2)} label="Team A partner" onSelect={setA2} value={a2} /> : null}
          </div>
          <span className="display muted" style={{ fontSize: 24 }}>VS</span>
          <div className="vstack" style={{ gap: 8 }}>
            <PlayerPicker excludeUserIds={pickedIds(b1)} label="Team B player" onSelect={setB1} value={b1} />
            {matchType === "DOUBLES" ? <PlayerPicker excludeUserIds={pickedIds(b2)} label="Team B partner" onSelect={setB2} value={b2} /> : null}
          </div>
        </div>
        <div className="formGrid">
          <div className="field"><label htmlFor="nm-round">Round</label><input className="input" id="nm-round" maxLength={50} onChange={(event) => setRound(event.target.value)} value={round} /></div>
          <div className="field"><label htmlFor="nm-location">Court or venue (optional)</label><input className="input" id="nm-location" maxLength={255} onChange={(event) => setLocation(event.target.value)} value={location} /></div>
        </div>
      </section>

      <section className="card">
        <h2>Officials (optional)</h2>
        <div className="formGrid">
          <div className="field"><span className="fieldLabel">Scorekeeper</span><PlayerPicker excludeUserIds={playerIds} label="Add scorekeeper" onSelect={setScorer} value={scorer} /></div>
          <div className="field"><span className="fieldLabel">Referee</span><PlayerPicker excludeUserIds={[...playerIds, ...(scorer ? [scorer.userId] : [])]} label="Add referee" onSelect={setReferee} value={referee} /></div>
        </div>
      </section>
      <Notice message={error} />
    </form>
  );
}
