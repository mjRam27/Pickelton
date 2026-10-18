// web/app/(app)/tournaments/[id]/leaderboard/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RefreshCw, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@pickelton/types";
import { Avatar, Empty, LoadError, Loading, PageHeader } from "../../../../../components/ui";
import { api, useResource, useSession } from "../../../../../lib/session";

export default function LeaderboardPage() {
  const { id } = useParams<{ id: string }>();
  const session = useSession();
  const { data, error, loading, reload } = useResource(async () => {
    const [board, event] = await Promise.all([api.tournaments.leaderboard(id), api.tournaments.get(id).catch(() => null)]);
    return { entries: board.entries, name: event?.name ?? "Leaderboard", updatedAt: new Date() };
  }, [id]);

  const label = (entry: LeaderboardEntry) => (entry.userId === session?.userId ? "You" : entry.name);
  const entries = data?.entries ?? [];
  const podium = [entries[1], entries[0], entries[2]];

  return (
    <>
      <PageHeader
        crumbs={<><Link href="/tournaments">Events</Link><span aria-hidden="true">/</span><Link href={`/tournaments/${id}`}>{data?.name ?? "Event"}</Link><span aria-hidden="true">/</span><span>Leaderboard</span></>}
        sub={data ? `Updated ${data.updatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : undefined}
        title={data?.name ?? "Leaderboard"}
      >
        <button className="btn" disabled={loading} onClick={reload} type="button"><RefreshCw aria-hidden="true" size={18} />Refresh</button>
      </PageHeader>

      {loading && !data ? <Loading label="Loading standings" /> : error && !data ? <LoadError message={error} onRetry={reload} /> : !entries.length ? (
        <Empty copy="Standings appear after the first completed match." title="No results yet" />
      ) : (
        <div className="columns">
          <section className="narrow">
            <div style={{ alignItems: "flex-end", display: "grid", gap: 10, gridTemplateColumns: "repeat(3, 1fr)" }}>
              {podium.map((entry, slot) => {
                if (!entry) return <span key={slot} />;
                const rank = slot === 1 ? 1 : slot === 0 ? 2 : 3;
                const first = rank === 1;
                return (
                  <div key={entry.userId} style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 6 }}>
                    {first ? <Trophy aria-hidden="true" color="var(--acc-ink)" size={22} /> : null}
                    <Avatar name={entry.name} size={first ? 60 : 50} tone={first ? "acc" : entry.userId === session?.userId ? "blu" : ""} />
                    <strong style={{ fontSize: 13, textAlign: "center" }}>{label(entry)}</strong>
                    <div style={{ alignItems: "center", alignSelf: "stretch", background: first ? "var(--acc)" : "var(--s1)", border: first ? 0 : "1px solid var(--line)", borderRadius: "16px 16px 6px 6px", color: first ? "var(--on-acc)" : "var(--text)", display: "flex", flexDirection: "column", height: first ? 124 : rank === 2 ? 92 : 72, justifyContent: "center" }}>
                      <span className="display" style={{ fontSize: first ? 56 : 40, lineHeight: 0.9 }}>{rank}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>{entry.points} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="wide">
            <div className="card" style={{ padding: 0, overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", fontSize: 14, width: "100%" }}>
                <thead>
                  <tr style={{ color: "var(--muted)", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {["#", "Player", "Played", "W–L", "Pts"].map((head, index) => <th key={head} style={{ padding: "14px 16px", textAlign: index < 2 ? "left" : "right" }}>{head}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={entry.userId} style={{ borderTop: "1px solid var(--line)" }}>
                      <td className="display" style={{ color: "var(--muted)", fontSize: 22, padding: "12px 16px" }}>{index + 1}</td>
                      <td style={{ color: entry.userId === session?.userId ? "var(--acc-ink)" : undefined, fontWeight: 700, padding: "12px 16px" }}>{label(entry)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>{entry.played}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>{entry.won}–{entry.lost}</td>
                      <td className="display" style={{ fontSize: 22, padding: "12px 16px", textAlign: "right" }}>{entry.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
