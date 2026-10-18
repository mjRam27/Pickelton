// web/app/(app)/matches/[id]/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Eye, RefreshCw, Undo2 } from "lucide-react";
import type { LiveScore, MatchScorecard, TeamCode } from "@pickelton/types";
import { ConfirmDialog, Loading, Notice, Spinner } from "../../../../components/ui";
import { api, errorMessage } from "../../../../lib/session";
import "./scoring.css";

type Board = { teams: [string, string]; score: [number, number]; games: Array<[number, number]>; status: string; currentSet: number; bestOf: number; pointsToWin: number | null };
const emptyBoard: Board = { teams: ["Team A", "Team B"], score: [0, 0], games: [], status: "CREATED", currentSet: 1, bestOf: 3, pointsToWin: null };

const numeric = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
// setSummary rows look like { A: 11, B: 8 }; anything else is ignored.
const completedGames = (summary: LiveScore["setSummary"] | undefined): Array<[number, number]> =>
  (summary ?? []).filter((game) => typeof game.A === "number" && typeof game.B === "number").map((game) => [game.A as number, game.B as number]);
const teamName = (card: MatchScorecard, team: TeamCode) => {
  const names = card.participants.filter((person) => person.role === "PLAYER" && person.team === team).map((person) => person.name.split(" ")[0]);
  return names.length ? names.join(" & ") : `Team ${team}`;
};

// Live scorer. Officials (?role=scorer) can tap a side to add a point; everyone else sees a read-only board.
export default function ScoringPage() {
  const { id } = useParams<{ id: string }>();
  const [canScore, setCanScore] = useState(false);
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<TeamCode | "UNDO" | "COMPLETE" | "">("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setCanScore(new URLSearchParams(window.location.search).get("role") === "scorer"); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const live = await api.matches.liveScore(id);
      setBoard((current) => ({ ...current, score: [numeric(live.currentScore?.A), numeric(live.currentScore?.B)], games: completedGames(live.setSummary), status: live.status, currentSet: live.currentSet ?? current.currentSet }));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const applyScorecard = (card: MatchScorecard) => setBoard((current) => ({
    ...current, teams: [teamName(card, "A"), teamName(card, "B")], score: [numeric(card.scores.A), numeric(card.scores.B)],
    status: card.status, currentSet: card.currentGameNumber, bestOf: card.bestOf, pointsToWin: card.pointsToWin,
  }));

  async function act(kind: TeamCode | "UNDO" | "COMPLETE", request: () => Promise<MatchScorecard>) {
    if (!canScore || busy) return;
    setBusy(kind);
    setConfirming(false);
    setError("");
    try {
      applyScorecard(await request());
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy("");
    }
  }

  // Keyboard shortcuts for scorekeepers at a laptop: A / B add a point, U undoes.
  useEffect(() => {
    if (!canScore) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.metaKey || event.ctrlKey || confirming) return;
      const key = event.key.toLowerCase();
      if (key === "a") void act("A", () => api.matches.addPoint(id, "A"));
      if (key === "b") void act("B", () => api.matches.addPoint(id, "B"));
      if (key === "u") void act("UNDO", () => api.matches.undo(id));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const done = board.status === "COMPLETED";
  const gamePoint = (mine: number, theirs: number) => board.pointsToWin != null && !done && mine >= board.pointsToWin - 1 && mine > theirs;
  const disabled = !canScore || done || Boolean(busy);

  return (
    <div className="scorer">
      <header className="row between">
        <div className="headStack">
          <span className="row" style={{ color: "var(--hot-ink)", fontSize: 12, fontWeight: 800, gap: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {!done ? <span className="pulse" /> : null}{done ? "Final" : `Live · Game ${board.currentSet} of ${board.bestOf}`}
          </span>
          <span className="muted" style={{ fontSize: 13 }}>{board.pointsToWin ? `To ${board.pointsToWin}` : "Live scorecard"} · {canScore ? "you're scoring (keys A, B, U)" : "view only"}</span>
        </div>
        <div className="row">
          <button className="btn" disabled={loading} onClick={load} type="button"><RefreshCw aria-hidden="true" size={18} />Refresh</button>
          <Link className="btn" href="/home">Close</Link>
        </div>
      </header>

      <div className="row" style={{ justifyContent: "center" }}>
        {Array.from({ length: board.bestOf }, (_, index) => {
          const game = board.games[index];
          const cls = game ? (game[0] > game[1] ? "badge acc" : "badge blu") : !done && index + 1 === board.currentSet ? "badge outline" : "badge plain";
          return <span className={cls} key={index}>{game ? `G${index + 1}  ${game[0]}–${game[1]}` : !done && index + 1 === board.currentSet ? `Game ${index + 1} · live` : `Game ${index + 1}`}</span>;
        })}
      </div>

      <Notice message={error} />
      {loading && board === emptyBoard ? <Loading label="Loading scorecard" /> : null}

      <div className="panels">
        {(["A", "B"] as const).map((team, index) => (
          <button
            aria-label={`${board.teams[index]}, ${board.score[index]} points${disabled ? "" : ". Add a point"}`}
            className={index === 0 ? "panel primary" : "panel"}
            disabled={disabled}
            key={team}
            onClick={() => act(team, () => api.matches.addPoint(id, team))}
            type="button"
          >
            <span className="panelName">{board.teams[index]}</span>
            <span className="panelScore">{busy === team ? <Spinner /> : board.score[index]}</span>
            {gamePoint(board.score[index], board.score[1 - index]) ? <span className="panelFlag">Game point</span> : null}
          </button>
        ))}
      </div>

      {canScore ? (
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn" disabled={done || Boolean(busy) || (board.score[0] === 0 && board.score[1] === 0)} onClick={() => act("UNDO", () => api.matches.undo(id))} type="button"><Undo2 aria-hidden="true" size={18} />Undo</button>
          <button className="btn dark" disabled={done || Boolean(busy)} onClick={() => setConfirming(true)} type="button">{done ? "Match saved" : "Finish match"}</button>
        </div>
      ) : (
        <div className="listRow" style={{ background: "var(--s2)", border: 0, justifyContent: "center" }}>
          <Eye aria-hidden="true" className="muted" size={18} /><small className="muted">View only. The match officials record points.</small>
        </div>
      )}

      <ConfirmDialog
        body="The result goes to both sides to confirm before it counts toward ratings."
        confirmLabel="Finish match"
        onCancel={() => setConfirming(false)}
        onConfirm={() => act("COMPLETE", () => api.matches.complete(id))}
        open={confirming}
        title="Finish match?"
      />
    </div>
  );
}
