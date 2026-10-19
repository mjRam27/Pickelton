// web/app/(app)/tournaments/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatCurrency, formatShortDate } from "@pickelton/utils";
import { DateBlock, Empty, LoadError, Loading, PageHeader } from "../../../components/ui";
import { sportInk, sportLabel } from "../../../lib/format";
import { api, useResource } from "../../../lib/session";

type Filter = "ALL" | "PICKLEBALL" | "BADMINTON";

export default function TournamentsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const { data, error, loading, reload } = useResource(() => api.tournaments.list({ size: 100 }));

  const items = data?.content ?? [];
  const live = items.find((item) => item.status === "ONGOING");
  const visible = items
    .filter((item) => item !== live)
    .filter((item) => filter === "ALL" || item.sportType === filter || item.sportType === "BOTH")
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <>
      <PageHeader title="Events">
        <Link className="btn primary" href="/tournaments/new"><Plus aria-hidden="true" size={18} />Host a tournament</Link>
      </PageHeader>

      {live ? (
        <Link className="card" href={`/tournaments/${live.id}/leaderboard`} style={{ borderColor: "var(--hot)", borderWidth: 1.5 }}>
          <div className="row between">
            <span className="row" style={{ color: "var(--hot-ink)", fontSize: 12, fontWeight: 800, gap: 6, letterSpacing: "0.08em" }}><span className="pulse" />LIVE NOW</span>
            <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>Standings</span>
          </div>
          <span className="display" style={{ fontSize: 32 }}>{live.name}</span>
          <span className="muted" style={{ fontSize: 14 }}>{[live.clubName, `${live.maxPlayers} players max`].filter(Boolean).join(" · ")}</span>
        </Link>
      ) : null}

      <div className="row">
        {(["ALL", "PICKLEBALL", "BADMINTON"] as Filter[]).map((value) => (
          <button aria-pressed={filter === value} className="chip" key={value} onClick={() => setFilter(value)} type="button">{value === "ALL" ? "All sports" : sportLabel(value)}</button>
        ))}
      </div>

      {loading && !data ? <Loading label="Loading events" /> : error && !data ? <LoadError message={error} onRetry={reload} /> : visible.length ? (
        <div className="grid">
          {visible.map((item) => (
            <Link className="listRow" href={`/tournaments/${item.id}`} key={item.id} style={{ alignItems: "flex-start" }}>
              <DateBlock color={sportInk(item.sportType)} date={item.startDate} />
              <span className="grow" style={{ gap: 5 }}>
                <strong style={{ whiteSpace: "normal" }}>{item.name}</strong>
                <small>{[formatShortDate(item.startDate), item.venue ?? item.clubName].filter(Boolean).join(" · ")}</small>
                <span className="row" style={{ fontSize: 12, fontWeight: 700, gap: 10 }}>
                  <span style={{ color: sportInk(item.sportType) }}>{sportLabel(item.sportType)}</span>
                  <span>{item.entryFee ? formatCurrency(item.entryFee) : "Free"}</span>
                  <span className="muted">{item.tournamentType === "DOUBLES" ? "Doubles" : "Singles"} · {item.registeredCount}/{item.maxPlayers} registered</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : <Empty copy="No events for this sport yet. Club owners and admins can host one." title="No events yet" />}
    </>
  );
}
