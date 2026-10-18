// web/app/(app)/tournaments/[id]/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Share2 } from "lucide-react";
import { formatCurrency, formatShortDate } from "@pickelton/utils";
import { Avatar, ConfirmDialog, Empty, LoadError, Loading, Notice, Spinner, shareOrCopy } from "../../../../components/ui";
import { formatTime, sportLabel, titleCase, toneFor } from "../../../../lib/format";
import { api, errorMessage, useResource, useSession } from "../../../../lib/session";

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useSession();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { data, error: loadError, loading, reload } = useResource(async () => {
    const [event, participants] = await Promise.all([api.tournaments.get(id), api.tournaments.participants(id).catch(() => [])]);
    return { event, participants };
  }, [id]);

  const participants = data?.participants ?? [];
  const entered = participants.some((person) => person.userId === session?.userId && person.status !== "CANCELLED");

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setConfirming(false);
    setMessage("");
    setError("");
    try {
      await action();
      setMessage(success);
      await reload();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) return <Loading label="Loading event" />;
  if (!data) return <LoadError message={loadError} onRetry={reload} />;
  const { event } = data;
  const spotsLeft = Math.max(event.maxPlayers - participants.length, 0);
  const startTime = formatTime(event.startDate);

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
        <span style={{ color: "#B5C0B9", position: "relative" }}>{event.clubName ? `Hosted by ${event.clubName}` : `Hosted by ${event.createdBy.name}`}</span>
      </div>

      <div className="statGrid">
        <div className="stat"><span className="label">When</span><span style={{ fontSize: 17, fontWeight: 800 }}>{formatShortDate(event.startDate)}</span><span className="hint">{startTime ? `Starts ${startTime}` : ""}</span></div>
        <div className="stat"><span className="label">Status</span><span style={{ fontSize: 17, fontWeight: 800 }}>{titleCase(event.status)}</span><span className="hint">{event.clubName ?? ""}</span></div>
        <div className="stat"><span className="label">Entry</span><span className="value" style={{ fontSize: 36 }}>{event.entryFee ? formatCurrency(event.entryFee) : "Free"}</span><span className="hint">per player</span></div>
        <div className="stat"><span className="label">Field</span><span className="value" style={{ fontSize: 36 }}>{participants.length}/{event.maxPlayers}</span><span className="hint">{spotsLeft ? `${spotsLeft} spots left` : "Full"}</span></div>
      </div>

      <div className="row">
        {entered ? <span className="row" style={{ color: "var(--acc-ink)", fontWeight: 700, gap: 6 }}><CheckCircle2 aria-hidden="true" size={18} />You're entered</span> : null}
        <span style={{ flex: 1 }} />
        <button className="btn" onClick={async () => setMessage(await shareOrCopy(`${event.name} on Pickelton`))} type="button"><Share2 aria-hidden="true" size={18} />Share</button>
        <Link className="btn dark" href={`/tournaments/${id}/leaderboard`}>Leaderboard</Link>
        {entered ? (
          <button className="btn" disabled={busy} onClick={() => setConfirming(true)} type="button">Cancel entry</button>
        ) : (
          <button className="btn primary" disabled={busy || spotsLeft === 0} onClick={() => run(() => api.tournaments.register(id), "You're entered. See you on court.")} type="button">
            {busy ? <Spinner /> : null}{spotsLeft === 0 ? "Full" : "Register"}
          </button>
        )}
      </div>
      <Notice message={message} tone="success" />
      <Notice message={error} />

      {event.description ? <p className="muted" style={{ lineHeight: 1.6, margin: 0, maxWidth: 760 }}>{event.description}</p> : null}

      <h2 style={{ fontSize: 18, margin: 0 }}>Players ({participants.length})</h2>
      {participants.length ? (
        <div className="grid">
          {participants.map((person) => (
            <div className="listRow" key={person.registrationId}>
              <Avatar name={person.name} tone={toneFor(person.userId)} />
              <span className="grow"><strong>{person.userId === session?.userId ? "You" : person.name}</strong></span>
              <span className={person.status === "REGISTERED" ? "badge acc" : "badge plain"}>{titleCase(person.status)}</span>
            </div>
          ))}
        </div>
      ) : <Empty copy="Players will appear here as registrations arrive." title="The field is open" />}

      <ConfirmDialog body="Your spot goes back to the field. You can register again while places are left." confirmLabel="Cancel entry" onCancel={() => setConfirming(false)} onConfirm={() => run(() => api.tournaments.cancelRegistration(id), "Registration cancelled.")} open={confirming} title="Cancel entry?" />
    </>
  );
}
