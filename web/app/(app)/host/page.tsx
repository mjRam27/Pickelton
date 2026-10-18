// web/app/(app)/host/page.tsx
"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { HostVerificationStatus } from "@pickelton/types";
import { Empty, LoadError, Loading, PageHeader } from "../../../components/ui";
import { api, useResource } from "../../../lib/session";

const COPY: Partial<Record<HostVerificationStatus, { badge: string; cls: string; title: string; body: string }>> = {
  APPROVED: { badge: "Approved", cls: "badge acc", title: "You're a verified host", body: "You can now create tournaments and collect entry fees in the app." },
  REJECTED: { badge: "Not approved", cls: "badge hot", title: "We couldn't verify you", body: "Check the reason below, update your details and apply again." },
  PENDING_REVIEW: { badge: "In review", cls: "badge blu", title: "We're checking your details", body: "Most applications are decided within 2 working days. We'll notify you when there's a decision." },
};

export default function HostDeskPage() {
  const { data: status, error, loading, reload } = useResource(() => api.host.mine());

  const state = status?.status ?? "PENDING_REVIEW";
  const copy = COPY[state] ?? COPY.PENDING_REVIEW!;
  const decided = state === "APPROVED" || state === "REJECTED";
  const steps = status ? [
    { title: "Application submitted", detail: new Date(status.submittedAt).toLocaleString("en-IN", { day: "numeric", hour: "2-digit", minute: "2-digit", month: "short" }), done: true },
    { title: "Identity review", detail: "Checking your document and selfie", done: decided },
    { title: "Decision & blue badge", detail: status.reviewedAt ? new Date(status.reviewedAt).toLocaleDateString("en-IN") : "We'll notify you by push and email", done: decided },
  ] : [];

  return (
    <div className="vstack" style={{ gap: 20, maxWidth: 760 }}>
      <PageHeader title="Host desk">
        {status && state !== "APPROVED" ? <Link className={state === "REJECTED" ? "btn primary" : "btn"} href="/host/apply">{state === "REJECTED" ? "Update application" : "Edit application"}</Link> : null}
        {state === "APPROVED" ? <Link className="btn primary" href="/tournaments/new">Create a tournament</Link> : null}
      </PageHeader>
      {loading && status === null && !error ? <Loading label="Loading your application" /> : error ? <LoadError message={error} onRetry={reload} /> : !status ? (
        <Empty action={<Link className="btn primary" href="/host/apply">Apply to host</Link>} copy="Verify your identity to run tournaments and take entry fees in the app. An admin reviews every application." title="No application yet" />
      ) : (
        <>
          <section className="card" style={{ padding: 24 }}>
            <span className={copy.cls} style={{ alignSelf: "flex-start" }}>{copy.badge}</span>
            <h2 className="display" style={{ fontSize: 44 }}>{copy.title}</h2>
            <p className="muted" style={{ lineHeight: 1.5, margin: 0 }}>{copy.body}</p>
            {status.rejectionReason ? <div className="notice">{status.rejectionReason}</div> : null}
            <span className="muted" style={{ fontSize: 12 }}>Reference {status.id.slice(0, 8).toUpperCase()} · {status.fullName}</span>
          </section>
          <ol className="vstack" style={{ gap: 0, listStyle: "none", margin: 0, padding: 0 }}>
            {steps.map((step, index) => (
              <li className="row" key={step.title} style={{ alignItems: "flex-start", flexWrap: "nowrap", gap: 12, paddingBottom: 18 }}>
                <span style={{ alignItems: "center", background: step.done ? "var(--acc)" : "transparent", border: step.done ? 0 : "2px solid var(--line)", borderRadius: "50%", color: step.done ? "var(--on-acc)" : "var(--muted)", display: "flex", flex: "none", fontWeight: 800, height: 32, justifyContent: "center", width: 32 }}>
                  {step.done ? <Check aria-hidden="true" size={18} /> : index + 1}
                </span>
                <span className="headStack"><strong style={{ color: step.done ? undefined : "var(--muted)" }}>{step.title}</strong><span className="muted" style={{ fontSize: 13 }}>{step.detail}</span></span>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
