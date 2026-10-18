// web/app/(app)/my-tournaments/page.tsx
"use client";

import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { formatCurrency, formatShortDate } from "@pickelton/utils";
import type { PaymentStatus } from "@pickelton/types";
import { DateBlock, Empty, LoadError, Loading, PageHeader } from "../../../components/ui";
import { sportInk, titleCase } from "../../../lib/format";
import { api, useResource } from "../../../lib/session";

const PAYMENT: Record<PaymentStatus, { label: string; cls: string }> = {
  NOT_REQUIRED: { label: "Confirmed", cls: "badge acc" },
  AWAITING_PAYMENT: { label: "Pay now", cls: "badge hot" },
  SUBMITTED: { label: "Awaiting host", cls: "badge blu" },
  CONFIRMED: { label: "Paid", cls: "badge acc" },
  REJECTED: { label: "Payment rejected", cls: "badge hot" },
};

// Tournaments you've entered (with payment status) and tournaments you host.
export default function MyTournamentsPage() {
  const { data, error, loading, reload } = useResource(async () => {
    const [registrations, hosted] = await Promise.all([api.tournaments.myRegistrations(), api.tournaments.hosted()]);
    return { registrations: registrations.filter((registration) => registration.status === "REGISTERED"), hosted };
  });

  return (
    <>
      <PageHeader title="My tournaments">
        <Link className="btn primary" href="/tournaments/new"><Plus aria-hidden="true" size={18} />Host a tournament</Link>
      </PageHeader>
      {loading && !data ? <Loading label="Loading your tournaments" /> : !data ? <LoadError message={error} onRetry={reload} /> : (
        <div className="columns">
          <section className="wide">
            <h2 style={{ fontSize: 18, margin: 0 }}>Playing in</h2>
            {data.registrations.length ? data.registrations.map((registration) => {
              const payment = PAYMENT[registration.paymentStatus];
              return (
                <Link className="listRow" href={`/tournaments/${registration.tournamentId}`} key={registration.id}>
                  <span className="grow">
                    <strong>{registration.tournamentName}</strong>
                    <small>{Number(registration.amountDue ?? 0) ? `Entry ${formatCurrency(Number(registration.amountDue))}` : "Free entry"}{registration.paymentReference ? ` · UTR ${registration.paymentReference}` : ""}</small>
                  </span>
                  <span className={payment.cls}>{payment.label}</span>
                </Link>
              );
            }) : <Empty action={<Link className="btn" href="/tournaments">Browse events</Link>} copy="Tournaments you register for show up here with their payment status." title="Not registered anywhere yet" />}
          </section>
          <section className="narrow">
            <h2 style={{ fontSize: 18, margin: 0 }}>Hosting</h2>
            {data.hosted.length ? data.hosted.map((event) => (
              <div className="listRow" key={event.id} style={{ alignItems: "flex-start" }}>
                <DateBlock color={sportInk(event.sportType)} date={event.startDate} />
                <span className="grow">
                  <Link href={`/tournaments/${event.id}`} style={{ color: "var(--text)", fontWeight: 800 }}>{event.name}</Link>
                  <small>{formatShortDate(event.startDate)} · {event.registeredCount}/{event.maxPlayers} registered · {titleCase(event.status)}</small>
                  <Link className="btn small" href={`/tournaments/${event.id}/manage`} style={{ alignSelf: "flex-start", marginTop: 6 }}><ClipboardList aria-hidden="true" size={16} />Registrations</Link>
                </span>
              </div>
            )) : <p className="muted" style={{ margin: 0 }}>You aren't hosting anything yet.</p>}
          </section>
        </div>
      )}
    </>
  );
}
