// web/app/(app)/home/page.tsx
"use client";

import Link from "next/link";
import { MapPin, Plus, Trophy } from "lucide-react";
import type { PlayerSuggestion } from "@pickelton/types";
import { formatShortDate } from "@pickelton/utils";
import { Avatar, DateBlock, Empty, Loading, Notice, PageHeader } from "../../../components/ui";
import { sportInk, titleCase, toneFor } from "../../../lib/format";
import { api, errorMessage, useResource, useSession } from "../../../lib/session";

const REASON: Record<PlayerSuggestion["reason"], (city: string | null) => string> = {
  RECENT_PLAYER: () => "Played with you recently",
  NEARBY: (city) => `Nearby · ${city ?? "your area"}`,
  COMMUNITY: (city) => city ?? "Pickelton community",
};

export default function HomePage() {
  const session = useSession();
  const userId = session?.userId;
  const { data, setData, error, loading } = useResource(async () => {
    const [stats, events, people] = await Promise.allSettled([
      userId ? api.users.stats(userId) : Promise.resolve(null),
      api.tournaments.list({ size: 50 }),
      api.users.suggestions(),
    ]);
    const now = Date.now();
    const failed = [stats, events, people].find((result) => result.status === "rejected");
    return {
      stats: stats.status === "fulfilled" ? stats.value : null,
      upcoming: events.status === "fulfilled"
        ? events.value.content.filter((event) => new Date(event.startDate).getTime() >= now)
          .sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 4)
        : [],
      people: people.status === "fulfilled" ? people.value : [],
      warning: failed?.status === "rejected" ? errorMessage(failed.reason) : "",
    };
  }, [userId]);

  async function toggleFollow(person: PlayerSuggestion) {
    const next = !person.following;
    const flip = (value: boolean) => setData((current) => current && { ...current, people: current.people.map((item) => (item.userId === person.userId ? { ...item, following: value } : item)) });
    flip(next);
    try {
      await (next ? api.users.follow(person.userId) : api.users.unfollow(person.userId));
    } catch {
      flip(!next);
    }
  }

  const stats = data?.stats;
  const winRate = stats && stats.totalMatches ? `${Math.round((stats.wins / stats.totalMatches) * 100)}%` : "–";
  const firstName = session?.name?.split(" ")[0] || "Player";

  return (
    <>
      <PageHeader sub={new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", weekday: "long" })} title={`Hi, ${firstName}`}>
        <Link className="btn" href="/tournaments"><Trophy aria-hidden="true" size={18} />Find events</Link>
        <Link className="btn" href="/clubs"><MapPin aria-hidden="true" size={18} />Clubs near me</Link>
        <Link className="btn primary" href="/matches/new"><Plus aria-hidden="true" size={18} />New match</Link>
      </PageHeader>
      <Notice message={error || data?.warning} />

      {loading && !data ? <Loading label="Loading your day" /> : (
        <>
          <section className="vstack">
            <div className="row between"><h2 style={{ fontSize: 18, margin: 0 }}>Your record</h2><Link href="/profile" style={{ fontSize: 13, fontWeight: 700 }}>All stats</Link></div>
            <div className="statGrid">
              <div className="stat"><span className="value">{stats ? stats.totalMatches : "–"}</span><span className="label">Matches</span></div>
              <div className="stat"><span className="value">{stats ? `${stats.wins}–${stats.losses}` : "–"}</span><span className="label">Won – lost</span></div>
              <div className="stat"><span className="value" style={{ color: "var(--hot-ink)" }}>{winRate}</span><span className="label">Win rate</span></div>
            </div>
          </section>

          <div className="columns">
            <section className="wide">
              <div className="row between"><h2 style={{ fontSize: 18, margin: 0 }}>Coming up</h2><Link href="/tournaments" style={{ fontSize: 13, fontWeight: 700 }}>All events</Link></div>
              {data?.upcoming.length ? data.upcoming.map((event) => (
                <Link className="listRow" href={`/tournaments/${event.id}`} key={event.id}>
                  <DateBlock color={event.sportType === "BADMINTON" ? "var(--blu-ink)" : "var(--hot-ink)"} date={event.startDate} />
                  <span className="grow">
                    <strong>{event.name}</strong>
                    <small>{[formatShortDate(event.startDate), event.clubName, event.tournamentType === "DOUBLES" ? "Doubles" : "Singles"].filter(Boolean).join(" · ")}</small>
                  </span>
                  <span className="badge outline" style={{ color: sportInk(event.sportType) }}>{titleCase(event.status)}</span>
                </Link>
              )) : <Empty action={<Link className="btn" href="/tournaments">Browse events</Link>} copy="No upcoming tournaments yet." title="Nothing scheduled" />}
            </section>

            <section className="narrow">
              <h2 style={{ fontSize: 18, margin: 0 }}>People to play with</h2>
              {data?.people.length ? data.people.map((person) => (
                <div className="listRow" key={person.userId}>
                  <Avatar name={person.name} tone={toneFor(person.userId)} />
                  <span className="grow"><strong>{person.name}</strong><small>{REASON[person.reason](person.city)}</small></span>
                  <button aria-pressed={person.following} className={person.following ? "btn primary small" : "btn small"} onClick={() => toggleFollow(person)} type="button">
                    {person.following ? "Following" : "Follow"}
                  </button>
                </div>
              )) : <p className="muted" style={{ margin: 0 }}>Play a match or set your city to get player suggestions.</p>}
            </section>
          </div>
        </>
      )}
    </>
  );
}
