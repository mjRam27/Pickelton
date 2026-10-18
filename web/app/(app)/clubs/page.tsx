// web/app/(app)/clubs/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, LocateFixed, Search } from "lucide-react";
import { Avatar, Empty, LoadError, Loading, Notice, PageHeader } from "../../../components/ui";
import { toneFor } from "../../../lib/format";
import { api, useResource } from "../../../lib/session";

type Coords = { latitude: number; longitude: number };

export default function ClubsPage() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, error, loading, reload } = useResource(() => api.clubs.list({ search: search || undefined, size: 50, ...(coords ?? {}) }), [search, coords]);

  // Location is opt-in on the web: only asked for when the user presses "Near me".
  function locate() {
    if (!navigator.geolocation) return setLocationError("This browser can't share your location.");
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => { setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude }); setLocating(false); },
      () => { setLocationError("Location is blocked. Allow it in your browser to sort clubs by distance."); setLocating(false); },
      { maximumAge: 300_000, timeout: 10_000 },
    );
  }

  const clubs = data?.content ?? [];
  return (
    <>
      <PageHeader sub={coords ? "Nearest first" : data ? `${data.totalElements} clubs` : undefined} title="Clubs">
        <button aria-pressed={Boolean(coords)} className={coords ? "btn primary" : "btn"} disabled={locating} onClick={coords ? () => setCoords(null) : locate} type="button">
          <LocateFixed aria-hidden="true" size={18} />{coords ? "Near me: on" : locating ? "Locating…" : "Near me"}
        </button>
      </PageHeader>
      <label className="searchBox">
        <span className="srOnly">Search clubs</span>
        <Search aria-hidden="true" size={18} />
        <input className="input" onChange={(event) => setQuery(event.target.value)} placeholder="Search clubs or locations" type="search" value={query} />
      </label>
      <Notice message={locationError} />

      {loading && !data ? <Loading label="Finding clubs" /> : error && !data ? <LoadError message={error} onRetry={reload} /> : clubs.length ? (
        <div className="grid" aria-busy={loading}>
          {clubs.map((club) => (
            <Link className="listRow" href={`/clubs/${club.id}`} key={club.id}>
              <Avatar name={club.name} size={52} square tone={toneFor(club.id)} />
              <span className="grow">
                <strong>{club.name}</strong>
                <small>{[club.location, club.distanceKm != null ? `${club.distanceKm.toFixed(1)} km` : null].filter(Boolean).join(" · ")}</small>
                <small style={{ color: "var(--acc-ink)", fontWeight: 700 }}>{club.memberCount} members</small>
              </span>
              <ChevronRight aria-hidden="true" className="muted" size={20} />
            </Link>
          ))}
        </div>
      ) : <Empty copy={search ? "No clubs match that search." : "No clubs yet. Check back after a local club is created."} title="No clubs in view" />}
    </>
  );
}
