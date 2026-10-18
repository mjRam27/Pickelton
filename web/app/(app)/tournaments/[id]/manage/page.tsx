// web/app/(app)/tournaments/[id]/manage/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Download, Link2, Swords, UserMinus, X } from "lucide-react";
import { formatCurrency } from "@pickelton/utils";
import type { HostRegistration, PaymentStatus } from "@pickelton/types";
import { ConfirmDialog, Empty, LoadError, Loading, Notice, PageHeader, Segmented, Spinner } from "../../../../../components/ui";
import { formatTime } from "../../../../../lib/format";
import { api, errorMessage, useResource } from "../../../../../lib/session";

type Filter = "ALL" | "SUBMITTED" | "AWAITING_PAYMENT" | "CONFIRMED" | "REJECTED";
const STATUS: Record<PaymentStatus, { label: string; cls: string }> = {
  NOT_REQUIRED: { label: "Free entry", cls: "badge plain" },
  AWAITING_PAYMENT: { label: "Not paid yet", cls: "badge outline" },
  SUBMITTED: { label: "Check payment", cls: "badge blu" },
  CONFIRMED: { label: "Paid", cls: "badge acc" },
  REJECTED: { label: "Rejected", cls: "badge hot" },
};
const when = (value: string | null) => (value ? `${new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${formatTime(value)}` : "");

// Host view: every registration with contact details, answers and payment to confirm against their UPI app.
export default function ManageRegistrationsPage() {
  const { id } = useParams<{ id: string }>();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rejecting, setRejecting] = useState<HostRegistration | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [removing, setRemoving] = useState<HostRegistration | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const { data, setData, error: loadError, loading, reload } = useResource(async () => {
    const [event, registrations] = await Promise.all([api.tournaments.get(id), api.tournaments.registrations(id)]);
    return { event, registrations };
  }, [id]);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/tournaments/${id}`);
    if (new URLSearchParams(window.location.search).get("created")) setNotice("Your tournament is live. Share the registration link below with players.");
  }, [id]);

  const active = useMemo(() => (data?.registrations ?? []).filter((row) => row.status === "REGISTERED"), [data]);
  const counts = useMemo(() => {
    const by = (status: PaymentStatus) => active.filter((row) => row.paymentStatus === status).length;
    const collected = active.filter((row) => row.paymentStatus === "CONFIRMED").reduce((sum, row) => sum + Number(row.amountDue ?? 0), 0);
    return { submitted: by("SUBMITTED"), awaiting: by("AWAITING_PAYMENT"), confirmed: by("CONFIRMED") + by("NOT_REQUIRED"), rejected: by("REJECTED"), collected };
  }, [active]);

  if (loading && !data) return <Loading label="Loading registrations" />;
  if (!data) return <LoadError message={loadError} onRetry={reload} />;
  const { event } = data;
  const questions = event.registrationQuestions;
  const categories = event.categories ?? [];
  const rows = active
    .filter((row) => filter === "ALL" || row.paymentStatus === filter)
    .filter((row) => categoryFilter === "ALL" || row.categories?.some((category) => category.id === categoryFilter));

  function replace(updated: HostRegistration) {
    setData((current) => current && { ...current, registrations: current.registrations.map((row) => (row.id === updated.id ? updated : row)) });
  }

  async function review(row: HostRegistration, status: "CONFIRMED" | "REJECTED", note?: string) {
    setBusy(row.id);
    setError("");
    setRejecting(null);
    try {
      replace(await api.tournaments.reviewPayment(id, row.id, { status, note }));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy("");
    }
  }

  async function remove(row: HostRegistration) {
    setRemoving(null);
    setBusy(row.id);
    setError("");
    try {
      await api.tournaments.removePlayer(id, row.userId);
      await reload();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy("");
    }
  }

  function exportCsv() {
    const header = ["Name", "Phone", "Email", ...(categories.length ? ["Categories"] : []), ...questions.map((question) => question.label), "Amount", "Payment", "UPI reference", "Registered"];
    const lines = active.map((row) => [row.name, row.phoneNumber, row.email,
      ...(categories.length ? [(row.categories ?? []).map((category) => category.name).join(", ")] : []), ...questions.map((question) => row.answers[question.id] ?? ""),
      Number(row.amountDue ?? 0), STATUS[row.paymentStatus].label, row.paymentReference ?? "", when(row.createdAt)]);
    const csv = [header, ...lines].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
    Object.assign(document.createElement("a"), { download: `${event.name.replace(/[^\w]+/g, "-")}-registrations.csv`, href: url }).click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        crumbs={<><Link href="/tournaments">Events</Link><span aria-hidden="true">/</span><Link href={`/tournaments/${id}`}>{event.name}</Link><span aria-hidden="true">/</span><span>Registrations</span></>}
        sub={`${active.length} of ${event.maxPlayers} spots taken`}
        title="Registrations"
      >
        <button className="btn" disabled={!active.length} onClick={exportCsv} type="button"><Download aria-hidden="true" size={18} />Export CSV</button>
        <Link className="btn" href={`/tournaments/${id}/matches`}><Swords aria-hidden="true" size={18} />Matches</Link>
        <Link className="btn" href={`/tournaments/${id}`}>View public page</Link>
      </PageHeader>
      <Notice message={notice} tone="success" />

      <section className="card">
        <h2>Registration link</h2>
        <div className="row">
          <input aria-label="Registration link" className="input" readOnly style={{ flex: "1 1 280px" }} value={shareUrl} />
          <button className="btn primary" onClick={async () => { await navigator.clipboard.writeText(shareUrl).catch(() => undefined); setNotice("Link copied. Share it on WhatsApp or Instagram."); }} type="button"><Link2 aria-hidden="true" size={18} />Copy link</button>
        </div>
      </section>

      <div className="statGrid">
        <div className="stat"><span className="value">{active.length}</span><span className="label">Registered</span></div>
        <div className="stat" style={counts.submitted ? { borderColor: "var(--blu)" } : undefined}><span className="value" style={{ color: counts.submitted ? "var(--blu-ink)" : undefined }}>{counts.submitted}</span><span className="label">Payments to check</span></div>
        <div className="stat"><span className="value">{counts.awaiting}</span><span className="label">Not paid yet</span></div>
        <div className="stat"><span className="value">{counts.confirmed}</span><span className="label">Confirmed</span></div>
        <div className="stat"><span className="value" style={{ fontSize: 36 }}>{formatCurrency(counts.collected)}</span><span className="label">Collected</span></div>
      </div>

      {categories.length ? (
        <section className="card">
          <h2>By category</h2>
          {categories.map((category) => (
            <div className="row between" key={category.id} style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
              <strong>{category.name}</strong>
              <span className="muted">{category.registeredCount}/{category.maxPlayers} players{category.format === "DOUBLES" ? ` · ${Math.floor(category.registeredCount / 2)} pairs` : ""}</span>
            </div>
          ))}
        </section>
      ) : null}

      {categories.length ? (
        <div className="field" style={{ maxWidth: 320 }}>
          <label htmlFor="cat-filter">Category</label>
          <select className="input" id="cat-filter" onChange={(event) => setCategoryFilter(event.target.value)} value={categoryFilter}>
            <option value="ALL">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name} ({category.registeredCount})</option>)}
          </select>
        </div>
      ) : null}
      <Segmented label="Filter by payment" onChange={setFilter} options={[
        { label: `All (${active.length})`, value: "ALL" }, { label: `To check (${counts.submitted})`, value: "SUBMITTED" },
        { label: `Not paid (${counts.awaiting})`, value: "AWAITING_PAYMENT" }, { label: `Paid (${counts.confirmed})`, value: "CONFIRMED" }, { label: `Rejected (${counts.rejected})`, value: "REJECTED" },
      ]} value={filter} />
      <Notice message={error} />
      {counts.submitted ? <p className="muted" style={{ margin: 0 }}>Open your UPI or bank app, find each payment by its UTR (and amount), then press <strong>Confirm</strong>.</p> : null}

      {rows.length ? (
        <div className="vstack">
          {rows.map((row) => {
            const status = STATUS[row.paymentStatus];
            return (
              <article className="card" key={row.id} style={{ gap: 10 }}>
                <div className="row between" style={{ alignItems: "flex-start" }}>
                  <div className="headStack">
                    <strong style={{ fontSize: 16 }}>{row.name}</strong>
                    <span className="muted" style={{ fontSize: 13 }}><a href={`tel:${row.phoneNumber}`}>{row.phoneNumber}</a> · <a href={`mailto:${row.email}`}>{row.email}</a> · registered {when(row.createdAt)}</span>
                  </div>
                  <span className={status.cls}>{status.label}</span>
                </div>
                {row.categories?.length ? (
                  <div className="row" style={{ gap: 6 }}>{row.categories.map((category) => <span className="badge outline" key={category.id}>{category.name}</span>)}</div>
                ) : null}
                {questions.length ? (
                  <dl className="formGrid" style={{ margin: 0 }}>
                    {questions.map((question) => (
                      <div key={question.id}><dt className="muted" style={{ fontSize: 12 }}>{question.label}</dt><dd style={{ fontWeight: 700, margin: 0 }}>{question.type === "CHECKBOX" ? (row.answers[question.id] ? "Yes" : "No") : row.answers[question.id] || "–"}</dd></div>
                    ))}
                  </dl>
                ) : null}
                {row.paymentStatus !== "NOT_REQUIRED" ? (
                  <div className="row between" style={{ background: "var(--s2)", borderRadius: 12, padding: "10px 12px" }}>
                    <span>
                      <strong>{formatCurrency(Number(row.amountDue ?? 0))}</strong>
                      {row.paymentReference ? <> · UTR <strong style={{ fontFamily: "monospace", fontSize: 15 }}>{row.paymentReference}</strong> <span className="muted">({when(row.paymentSubmittedAt)})</span></> : <span className="muted"> · no reference yet</span>}
                      {row.paymentStatus === "REJECTED" && row.hostNote ? <span className="muted"> · your note: {row.hostNote}</span> : null}
                    </span>
                    <div className="row" style={{ gap: 6 }}>
                      {row.paymentStatus === "SUBMITTED" || row.paymentStatus === "REJECTED" || row.paymentStatus === "AWAITING_PAYMENT" ? (
                        <button className="btn primary small" disabled={busy === row.id} onClick={() => review(row, "CONFIRMED")} type="button">
                          {busy === row.id ? <Spinner /> : <Check aria-hidden="true" size={16} />}{row.paymentStatus === "AWAITING_PAYMENT" ? "Mark paid (cash)" : "Confirm"}
                        </button>
                      ) : null}
                      {row.paymentStatus === "SUBMITTED" || row.paymentStatus === "CONFIRMED" ? (
                        <button className="btn small" disabled={busy === row.id} onClick={() => { setRejecting(row); setRejectNote(""); }} type="button"><X aria-hidden="true" size={16} />{row.paymentStatus === "CONFIRMED" ? "Undo" : "Reject"}</button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <button className="btn ghost small" disabled={busy === row.id} onClick={() => setRemoving(row)} style={{ alignSelf: "flex-start", color: "var(--muted)" }} type="button"><UserMinus aria-hidden="true" size={16} />Remove player</button>
              </article>
            );
          })}
        </div>
      ) : <Empty copy={active.length ? "No registrations match this filter." : "Share the registration link and players will appear here as they sign up."} title={active.length ? "Nothing here" : "No registrations yet"} />}

      {rejecting ? (
        <div className="dialogBackdrop" onClick={() => setRejecting(null)}>
          <form aria-labelledby="reject-title" aria-modal="true" className="dialog" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); void review(rejecting, "REJECTED", rejectNote.trim() || undefined); }} role="dialog">
            <h2 id="reject-title">Reject payment?</h2>
            <p className="muted" style={{ margin: 0 }}>{rejecting.name} will see your reason and can submit a corrected reference.</p>
            <div className="field"><label htmlFor="reject-note">Reason for the player</label><input autoFocus className="input" id="reject-note" maxLength={300} onChange={(event) => setRejectNote(event.target.value)} placeholder="e.g. No payment with this UTR. Please check it." value={rejectNote} /></div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setRejecting(null)} type="button">Cancel</button>
              <button className="btn danger" type="submit">Reject payment</button>
            </div>
          </form>
        </div>
      ) : null}
      <ConfirmDialog body={`${removing?.name ?? "This player"} loses their spot. If they paid, refund them directly.`} confirmLabel="Remove player" onCancel={() => setRemoving(null)} onConfirm={() => removing && remove(removing)} open={Boolean(removing)} title="Remove player?" />
    </>
  );
}
