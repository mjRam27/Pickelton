// web/app/(app)/clubs/[id]/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Share2 } from "lucide-react";
import type { ClubMember } from "@pickelton/types";
import { Avatar, Empty, LoadError, Loading, Notice, PageHeader, Segmented, Spinner, shareOrCopy } from "../../../../components/ui";
import { toneFor } from "../../../../lib/format";
import { api, errorMessage, useResource, useSession } from "../../../../lib/session";

export default function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useSession();
  const [tab, setTab] = useState<"about" | "members">("about");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { data, error: loadError, loading, reload } = useResource(async () => {
    const [club, members] = await Promise.all([api.clubs.get(id), api.clubs.members(id)]);
    return { club, members };
  }, [id]);

  const members = data?.members ?? [];
  const mine = members.find((member) => member.user.id === session?.userId);
  const isAdmin = mine?.role === "ADMIN";

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
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
  const toggleRole = (member: ClubMember) => run(
    () => api.clubs.setRole(id, member.user.id, member.role === "ADMIN" ? "MEMBER" : "ADMIN"),
    `${member.user.name} is now ${member.role === "ADMIN" ? "a member" : "an admin"}.`,
  );

  const crumbs = <><Link href="/clubs">Clubs</Link><span aria-hidden="true">/</span><span>{data?.club.name ?? "Club"}</span></>;
  if (loading && !data) return <><PageHeader crumbs={crumbs} title="Club" /><Loading label="Loading club" /></>;
  if (!data) return <><PageHeader crumbs={crumbs} title="Club" /><LoadError message={loadError} onRetry={reload} /></>;
  const { club } = data;

  return (
    <>
      <nav aria-label="Breadcrumb" className="crumbs">{crumbs}</nav>
      <div className="card" style={{ gap: 0, overflow: "hidden", padding: 0 }}>
        <div style={{ background: "#2B5A12", height: 140 }}>
          <svg aria-hidden="true" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 140" width="100%">
            <g fill="none" opacity="0.55" stroke="#C8F03C" strokeWidth="3" transform="rotate(-4 600 70)"><rect height="120" width="1300" x="-50" y="10" /><path d="M-50 70h1300M600 10v120M300 10v120M900 10v120" /></g>
          </svg>
        </div>
        <div className="row" style={{ alignItems: "flex-end", gap: 16, marginTop: -36, padding: "0 24px 24px" }}>
          <span style={{ border: "4px solid var(--s1)", borderRadius: "30%", display: "inline-flex" }}><Avatar name={club.name} size={72} square tone={toneFor(club.id)} /></span>
          <div className="headStack" style={{ flex: 1, minWidth: 220 }}>
            <h1 className="display" style={{ fontSize: 40, marginTop: 40 }}>{club.name}</h1>
            <span className="muted">{club.location}</span>
          </div>
          <div className="row">
            <button className="btn" onClick={async () => setMessage(await shareOrCopy(`${club.name} on Pickelton`))} type="button"><Share2 aria-hidden="true" size={18} />Share</button>
            <button className={mine ? "btn" : "btn primary"} disabled={busy} onClick={() => (mine ? run(() => api.clubs.leave(id), "You left the club.") : run(() => api.clubs.join(id), "You joined the club. Welcome to the roster."))} type="button">
              {busy ? <Spinner /> : null}{mine ? "Leave club" : "Join club"}
            </button>
          </div>
        </div>
      </div>

      <div className="statGrid">
        <div className="stat"><span className="value">{members.length}</span><span className="label">Members</span></div>
        <div className="stat"><span className="value">{members.filter((member) => member.role === "ADMIN").length}</span><span className="label">Admins</span></div>
        <div className="stat"><span className="value">{mine ? (isAdmin ? "Admin" : "Member") : "Guest"}</span><span className="label">Your role</span></div>
      </div>
      <Notice message={message} tone="success" />
      <Notice message={error} />

      <Segmented label="Club sections" onChange={setTab} options={[{ label: "About", value: "about" }, { label: `Members (${members.length})`, value: "members" }]} value={tab} />
      {tab === "about" ? (
        <p style={{ lineHeight: 1.6, margin: 0, maxWidth: 720 }}>{club.description || "This club hasn't added a description yet."}</p>
      ) : members.length ? (
        <div className="grid">
          {members.map((member) => {
            const canManage = isAdmin && member.user.id !== session?.userId;
            return (
              <div className="listRow" key={member.id}>
                <Avatar name={member.user.name} tone={toneFor(member.user.id)} />
                <span className="grow"><strong>{member.user.id === session?.userId ? "You" : member.user.name}</strong><small>{member.user.city ?? ""}</small></span>
                {canManage ? (
                  <button className="btn small" disabled={busy} onClick={() => toggleRole(member)} type="button">{member.role === "ADMIN" ? "Demote" : "Make admin"}</button>
                ) : <span className={member.role === "ADMIN" ? "badge acc" : "badge plain"}>{member.role === "ADMIN" ? "Admin" : "Member"}</span>}
              </div>
            );
          })}
        </div>
      ) : <Empty copy="Join the club to become its first regular." title="No members yet" />}
    </>
  );
}
