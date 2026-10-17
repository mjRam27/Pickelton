// partner/app/partner/(portal)/courts/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Court, CourtSport } from "@pickelton/types";
import { Empty, LoadError, Loading, Notice, PageHeader, Switch, sportLabel, sportTone } from "../../../../components/ui";
import { errorMessage, money, partnerApi, useResource } from "../../../../lib/partner";
import "./courts.css";

type Filter = "ALL" | CourtSport;

export default function CourtsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const { data, setData, error: loadError, loading, reload } = useResource(async () => {
    const [courts, dashboard] = await Promise.all([partnerApi.courts.list({ size: 100 }), partnerApi.dashboard()]);
    return { courts: courts.content, usage: new Map(dashboard.courtUtilization.map((row) => [row.id, row])) };
  });

  async function setBookable(court: Court, bookable: boolean) {
    setSaving(court.id);
    setError("");
    try {
      const updated = await partnerApi.courts.update(court.id, { status: bookable ? "ACTIVE" : "INACTIVE" });
      setData((current) => current && { ...current, courts: current.courts.map((item) => (item.id === court.id ? { ...item, ...updated } : item)) });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving("");
    }
  }

  const courts = data?.courts ?? [];
  const visible = courts.filter((court) => filter === "ALL" || court.sport === filter);
  const active = courts.filter((court) => court.status === "ACTIVE").length;
  const paused = courts.length - active;

  return (
    <>
      <PageHeader sub={data ? `${active} active${paused ? ` · ${paused} not bookable` : ""}` : undefined} title="Courts">
        <Link className="btn primary" href="/partner/courts/add"><Plus aria-hidden="true" size={18} />Add court</Link>
      </PageHeader>
      <div className="row">
        {(["ALL", "PICKLEBALL", "BADMINTON", "MULTI_SPORT"] as Filter[]).map((value) => (
          <button aria-pressed={filter === value} className="chip" key={value} onClick={() => setFilter(value)} type="button">{value === "ALL" ? "All courts" : sportLabel(value)}</button>
        ))}
      </div>
      <Notice message={error} />

      {loading && !data ? <Loading label="Loading courts" /> : loadError && !data ? <LoadError message={loadError} onRetry={reload} /> : visible.length ? (
        <div className="courtGrid">
          {visible.map((court) => {
            const usage = data?.usage.get(court.id);
            const bookable = court.status === "ACTIVE";
            return (
              <article className="card courtCard" key={court.id}>
                <div className="row between" style={{ alignItems: "flex-start" }}>
                  <div className="headStack">
                    <span className="display courtTitle">{court.name}</span>
                    <span className="muted">{[court.indoor ? "Indoor" : "Outdoor", court.surface].filter(Boolean).join(" · ")}</span>
                  </div>
                  <span className={`tag ${sportTone(court.sport)}`}>{sportLabel(court.sport)}</span>
                </div>
                <div className="courtFacts">
                  <div><span>Per hour</span><strong className="display">{money(court.hourly_rate)}</strong></div>
                  <div><span>Booked hours</span><strong className="display">{Math.round(usage?.booked_hours ?? 0)}</strong></div>
                </div>
                {court.status === "MAINTENANCE" ? <span className="badge hot" style={{ alignSelf: "flex-start" }}>In maintenance</span> : null}
                <div className="toggleRow courtToggle">
                  <strong>Bookable online</strong>
                  <Switch checked={bookable} disabled={saving === court.id} label={`${court.name} bookable online`} onChange={(value) => setBookable(court, value)} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty action={<Link className="btn primary" href="/partner/courts/add">Add court</Link>} copy={courts.length ? "No courts match this filter." : "Add your first court so players can find and book it."} title={courts.length ? "Nothing here" : "No courts yet"} />
      )}
    </>
  );
}
