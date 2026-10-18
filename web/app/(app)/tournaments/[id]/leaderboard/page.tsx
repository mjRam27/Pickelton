// web/app/(app)/tournaments/[id]/leaderboard/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RefreshCw, Swords, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@pickelton/types";
import { Avatar, Empty, LoadError, Loading, PageHeader, Segmented } from "../../../../../components/ui";
import { api, useResource, useSession } from "../../../../../lib/session";

const signed = (value: number) => (value > 0 ? `+${value}` : String(value));

// Standings from completed matches, one table per category. Public, so the link can be shared.
export default function LeaderboardPage() {
  const { id } = useParams<{ id: string }>();
  const session = useSession();
  const [categoryId, setCategoryId] = useState("");
  const { data, error, loading, reload } = useResource(async () => {
    const [board, event] = await Promise.all([api.tournaments.leaderboard(id), api.tournaments.get(id).catch(() => null)]);
    return { board, name: event?.name ?? "Leaderboard", updatedAt: new Date() };
  }, [id]);

  const categories = data?.board.categories ?? [];
  const current = categories.find((category) => category.categoryId === categoryId) ?? categories[0] ?? null;
  const entries = (current ? current.entries : data?.board.entries) ?? [];
  const ranked = entries.filter((entry) => entry.played > 0);
  const isMe = (entry: LeaderboardEntry) => entry.players?.some((player) => player.userId === session?.userId) ?? entry.userId === session?.userId;
  const label = (entry: LeaderboardEntry) => (entry.players?.length === 1 && isMe(entry) ? "You" : entry.name);
  const podium = [ranked[1], ranked[0], ranked[2]];

  return (
    <>
      <PageHeader
        crumbs={<><Link href="/tournaments">Events</Link><span aria-hidden="true">/</span><Link href={`/tournaments/${id}`}>{data?.name ?? "Event"}</Link><span aria-hidden="true">/</span><span>Leaderboard</span></>}
        sub={data ? `Ranked by wins, then point difference · updated ${data.updatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : undefined}
        title={data?.name ?? "Leaderboard"}
      >
        {session ? <Link className="btn" href={`/tournaments/${id}/matches`}><Swords aria-hidden="true" size={18} />Matches</Link> : null}
        <button className="btn" disabled={loading} onClick={reload} type="button"><RefreshCw aria-hidden="true" size={18} />Refresh</button>
      </PageHeader>

      {categories.length ? (
        <div style={{ overflowX: "auto" }}>
          <Segmented label="Category" onChange={setCategoryId} options={categories.map((category) => ({ label: category.name, value: category.categoryId }))} value={current?.categoryId ?? ""} />
        </div>
      ) : null}

      {loading && !data ? <Loading label="Loading standings" /> : error && !data ? <LoadError message={error} onRetry={reload} /> : !entries.length ? (
        <Empty copy="Standings appear after the first completed match." title="No results yet" />
      ) : (
        <div className="columns">
          {ranked.length ? (
            <section className="narrow">
              <div style={{ alignItems: "flex-end", display: "grid", gap: 10, gridTemplateColumns: "repeat(3, 1fr)" }}>
                {podium.map((entry, slot) => {
                  if (!entry) return <span key={slot} />;
                  const rank = slot === 1 ? 1 : slot === 0 ? 2 : 3;
                  const first = rank === 1;
                  return (
                    <div key={entry.players?.map((player) => player.userId).join("+") ?? entry.userId} style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                      {first ? <Trophy aria-hidden="true" color="var(--acc-ink)" size={22} /> : null}
                      <Avatar name={entry.name} size={first ? 60 : 50} tone={first ? "acc" : isMe(entry) ? "blu" : ""} />
                      <strong style={{ fontSize: 13, overflowWrap: "anywhere", textAlign: "center" }}>{label(entry)}</strong>
                      <div style={{ alignItems: "center", alignSelf: "stretch", background: first ? "var(--acc)" : "var(--s1)", border: first ? 0 : "1px solid var(--line)", borderRadius: "16px 16px 6px 6px", color: first ? "var(--on-acc)" : "var(--text)", display: "flex", flexDirection: "column", height: first ? 124 : rank === 2 ? 92 : 72, justifyContent: "center" }}>
                        <span className="display" style={{ fontSize: first ? 56 : 40, lineHeight: 0.9 }}>{rank}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>{entry.won}W · {signed(entry.pointDiff ?? 0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
          <section className="wide">
            <div className="card" style={{ padding: 0, overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", fontSize: 14, width: "100%" }}>
                <thead>
                  <tr style={{ color: "var(--muted)", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {["#", current?.format === "DOUBLES" ? "Team" : "Player", "P", "W–L", "+/−"].map((head, index) => (
                      <th key={head} style={{ padding: "14px 12px", textAlign: index < 2 ? "left" : "right", whiteSpace: "nowrap" }}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={entry.players?.map((player) => player.userId).join("+") ?? entry.userId} style={{ borderTop: "1px solid var(--line)" }}>
                      <td className="display" style={{ color: "var(--muted)", fontSize: 22, padding: "12px" }}>{entry.played ? index + 1 : "–"}</td>
                      <td style={{ color: isMe(entry) ? "var(--acc-ink)" : undefined, fontWeight: 700, padding: "12px" }}>{label(entry)}</td>
                      <td style={{ padding: "12px", textAlign: "right" }}>{entry.played}</td>
                      <td style={{ padding: "12px", textAlign: "right", whiteSpace: "nowrap" }}>{entry.won}–{entry.lost}</td>
                      <td className="display" style={{ fontSize: 22, padding: "12px", textAlign: "right" }}>{signed(entry.pointDiff ?? 0)}</td>
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
