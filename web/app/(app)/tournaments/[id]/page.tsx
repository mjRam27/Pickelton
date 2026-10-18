// web/app/(app)/tournaments/[id]/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClipboardList, Link2, MapPin, Swords, Trophy } from "lucide-react";
import { formatCurrency, formatShortDate } from "@pickelton/utils";
import { RegistrationPanel, categoryFull } from "../../../../components/RegistrationPanel";
import { Avatar, LoadError, Loading, Notice } from "../../../../components/ui";
import { formatTime, sportLabel, titleCase, toneFor } from "../../../../lib/format";
import { api, useResource, useSession } from "../../../../lib/session";

// Public tournament page: anyone can view it from a shared link; signed-in players register and pay here.
export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useSession();
  const signedIn = Boolean(session);
  const [copied, setCopied] = useState("");
  const { data, error, loading, reload } = useResource(async () => {
    const [event, participants, registration] = await Promise.all([
      api.tournaments.get(id),
      signedIn ? api.tournaments.participants(id).catch(() => []) : Promise.resolve([]),
      signedIn ? api.tournaments.myRegistration(id).catch(() => null) : Promise.resolve(null),
    ]);
    return { event, participants, registration };
  }, [id, signedIn]);

  if (loading && !data) return <Loading label="Loading tournament" />;
  if (!data) return <LoadError message={error} onRetry={reload} />;
  const { event, participants, registration } = data;
  const isHost = session?.userId === event.createdBy.id;
  const spotsLeft = Math.max(event.maxPlayers - event.registeredCount, 0);
  const fee = Number(event.entryFee ?? 0);
  const categories = event.categories ?? [];
  // With categories, entryFee is the lowest category fee.
  const maxFee = categories.length ? Math.max(...categories.map((category) => Number(category.entryFee ?? 0))) : fee;
  const categoryName = (categoryId: string) => categories.find((category) => category.id === categoryId)?.name;

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href).catch(() => undefined);
    setCopied("Registration link copied. Share it with players.");
  }

  return (
    <>
      <div className="card" style={{ background: "#0C100E", border: 0, color: "#F2F5EF", gap: 12, overflow: "hidden", padding: 28, position: "relative" }}>
        <svg aria-hidden="true" height="260" style={{ position: "absolute", right: -60, top: -40 }} width="360">
          <circle cx="180" cy="130" fill="none" opacity="0.35" r="120" stroke="#C8F03C" strokeWidth="2" />
          <circle cx="180" cy="130" fill="none" opacity="0.25" r="80" stroke="#C8F03C" strokeWidth="2" />
          <circle cx="180" cy="130" fill="#C8F03C" opacity="0.18" r="40" />
        </svg>
        <nav aria-label="Breadcrumb" className="crumbs" style={{ position: "relative" }}><Link href="/tournaments" style={{ color: "#B5C0B9" }}>Events</Link><span aria-hidden="true">/</span><span style={{ color: "#F2F5EF" }}>{event.name}</span></nav>
        <span className="badge acc" style={{ alignSelf: "flex-start", position: "relative" }}>{sportLabel(event.sportType)} · {event.tournamentType === "DOUBLES" ? "Doubles" : "Singles"}</span>
        <h1 className="display" style={{ fontSize: "clamp(40px, 5vw, 56px)", position: "relative" }}>{event.name}</h1>
        <span style={{ color: "#B5C0B9", position: "relative" }}>Hosted by {event.clubName ?? event.createdBy.name}</span>
        {event.venue ? <span className="row" style={{ color: "#F2F5EF", gap: 6, position: "relative" }}><MapPin aria-hidden="true" size={16} />{event.venue}</span> : null}
      </div>

      {isHost ? (
        <div className="row">
          <Link className="btn primary" href={`/tournaments/${id}/manage`}><ClipboardList aria-hidden="true" size={18} />Manage registrations</Link>
          <Link className="btn" href={`/tournaments/${id}/matches`}><Swords aria-hidden="true" size={18} />Matches</Link>
          <button className="btn" onClick={copyLink} type="button"><Link2 aria-hidden="true" size={18} />Copy registration link</button>
          <Link className="btn ghost" href={`/tournaments/${id}/leaderboard`}><Trophy aria-hidden="true" size={18} />Leaderboard</Link>
        </div>
      ) : (
        <div className="row">
          <Link className="btn" href={`/tournaments/${id}/leaderboard`}><Trophy aria-hidden="true" size={18} />Leaderboard</Link>
          {signedIn ? <Link className="btn ghost" href={`/tournaments/${id}/matches`}><Swords aria-hidden="true" size={18} />Matches</Link> : null}
        </div>
      )}
      <Notice message={copied} tone="success" />

      <div className="statGrid">
        <div className="stat"><span className="label">When</span><span style={{ fontSize: 17, fontWeight: 800 }}>{formatShortDate(event.startDate)}</span><span className="hint">Starts {formatTime(event.startDate)}</span></div>
        <div className="stat"><span className="label">Entry</span><span className="value" style={{ fontSize: 36 }}>{maxFee ? formatCurrency(fee) : "Free"}</span><span className="hint">{!maxFee ? "no entry fee" : fee !== maxFee ? `up to ${formatCurrency(maxFee)} per category` : categories.length ? "per category, by UPI" : "per player, by UPI"}</span></div>
        <div className="stat"><span className="label">Spots</span><span className="value" style={{ fontSize: 36 }}>{event.registeredCount}/{event.maxPlayers}</span><span className="hint">{spotsLeft ? `${spotsLeft} left` : "Full"}</span></div>
        <div className="stat"><span className="label">Registration</span><span style={{ fontSize: 17, fontWeight: 800 }}>{event.status === "UPCOMING" ? "Open" : titleCase(event.status)}</span><span className="hint">{event.registrationDeadline ? `Closes ${formatShortDate(event.registrationDeadline)}, ${formatTime(event.registrationDeadline)}` : "Until the start"}</span></div>
      </div>

      <div className="columns">
        <section className="wide">
          {categories.length ? (
            <section className="card">
              <h2>Categories</h2>
              {categories.map((category) => (
                <div className="row between" key={category.id} style={{ borderTop: "1px solid var(--line)", flexWrap: "nowrap", paddingTop: 10 }}>
                  <span className="vstack" style={{ gap: 2, minWidth: 0 }}>
                    <strong>{category.name}</strong>
                    <small className="muted">{category.format === "DOUBLES" ? "Doubles" : "Singles"} · {categoryFull(category) ? "Full" : `${category.registeredCount}/${category.maxPlayers} registered`}</small>
                  </span>
                  <strong>{Number(category.entryFee ?? 0) ? formatCurrency(Number(category.entryFee)) : "Free"}</strong>
                </div>
              ))}
            </section>
          ) : null}
          <RegistrationPanel key={`${registration?.id ?? "none"}-${registration?.status ?? ""}`} onChanged={reload} registration={registration} tournament={event} />
          {event.description ? (
            <section className="card"><h2>About this tournament</h2><p style={{ lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{event.description}</p></section>
          ) : null}
        </section>
        <aside className="narrow">
          <section className="card">
            <h2>Players ({event.registeredCount})</h2>
            {!signedIn ? <p className="muted" style={{ margin: 0 }}>Log in to see who's playing.</p>
              : participants.length ? participants.slice(0, 40).map((person) => (
                <div className="row" key={person.registrationId} style={{ flexWrap: "nowrap" }}>
                  <Avatar name={person.name} size={32} tone={toneFor(person.userId)} />
                  <span className="vstack" style={{ gap: 0, minWidth: 0 }}>
                    <span style={{ fontWeight: 700 }}>{person.userId === session?.userId ? "You" : person.name}</span>
                    {categories.length && person.categoryIds?.length ? <small className="muted">{person.categoryIds.map(categoryName).filter(Boolean).join(", ")}</small> : null}
                  </span>
                </div>
              )) : <p className="muted" style={{ margin: 0 }}>Be the first to register.</p>}
          </section>
        </aside>
      </div>
    </>
  );
}
