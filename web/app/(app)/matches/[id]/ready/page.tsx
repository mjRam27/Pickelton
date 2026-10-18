// web/app/(app)/matches/[id]/ready/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Copy } from "lucide-react";
import { Notice, PageHeader } from "../../../../../components/ui";

// After creating a match: confirms invites went out and tells you your role, then opens the scorer.
export default function MatchReadyPage() {
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = useState("viewer");
  const [copied, setCopied] = useState("");
  useEffect(() => { setRole(new URLSearchParams(window.location.search).get("role") ?? "viewer"); }, []);
  const authorized = role === "scorer" || role === "referee";
  const roleLabel = role === "scorer" ? "Scorekeeper" : role === "referee" ? "Referee" : "Spectator";
  const scoreUrl = `/matches/${id}${authorized ? "?role=scorer" : ""}`;

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/matches/${id}`).catch(() => undefined);
    setCopied("Match link copied.");
  }

  return (
    <div className="vstack" style={{ gap: 20, maxWidth: 640 }}>
      <PageHeader sub="Players accept from their invitations" title="Invites sent" />
      <div className="listRow" style={{ background: "var(--s2)", border: 0 }}>
        <CheckCircle2 aria-hidden="true" color="var(--acc-ink)" size={28} />
        <span className="grow"><small style={{ color: "var(--text)" }}>Your match is set up. Results count toward ratings only after both sides confirm.</small></span>
      </div>
      <section className="card">
        <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>You're on this match as</span>
        <span className="display" style={{ color: "var(--acc-ink)", fontSize: 48 }}>{roleLabel}</span>
        <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{authorized ? "You can record points from the scorer." : "You can follow the live score."}</span>
      </section>
      <div className="row">
        <Link className="btn primary" href={scoreUrl}>{authorized ? "Open the scorer" : "Watch live score"}<ArrowRight aria-hidden="true" size={18} /></Link>
        <button className="btn" onClick={copyLink} type="button"><Copy aria-hidden="true" size={18} />Copy match link</button>
        <Link className="btn ghost" href="/home">Back to Home</Link>
      </div>
      <Notice message={copied} tone="success" />
    </div>
  );
}
