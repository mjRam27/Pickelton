// partner/app/partner/(portal)/bookings/[id]/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { BookingStatus } from "@pickelton/types";
import { Avatar, BookingBadge, LoadError, Loading, Notice, PageHeader } from "../../../../../components/ui";
import { errorMessage, formatDate, formatTime, money, partnerApi, toNumber, useResource } from "../../../../../lib/partner";

// Which status changes make sense from each state.
const NEXT: Record<BookingStatus, Array<{ status: BookingStatus; label: string; tone: "primary" | "danger" | "" }>> = {
  PENDING: [{ status: "REJECTED", label: "Reject", tone: "danger" }, { status: "CONFIRMED", label: "Confirm booking", tone: "primary" }],
  CONFIRMED: [{ status: "CANCELLED", label: "Cancel booking", tone: "danger" }, { status: "COMPLETED", label: "Mark as played", tone: "primary" }],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [busy, setBusy] = useState<BookingStatus | "">("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { data: booking, setData, error: loadError, loading, reload } = useResource(() => partnerApi.bookings.get(id), [id]);

  async function changeStatus(status: BookingStatus) {
    if ((status === "CANCELLED" || status === "REJECTED") && !window.confirm(`${status === "CANCELLED" ? "Cancel" : "Reject"} this booking? The player will no longer have the court.`)) return;
    setBusy(status);
    setError("");
    setMessage("");
    try {
      const updated = await partnerApi.bookings.setStatus(id, status);
      setData((current) => current && { ...current, ...updated });
      setMessage("Booking updated.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy("");
    }
  }

  const crumbs = <><Link href="/partner/bookings">Bookings</Link><span aria-hidden="true">/</span><span>{booking?.reference ?? "Booking"}</span></>;
  if (loading && !booking) return <><PageHeader crumbs={crumbs} title="Booking" /><Loading label="Loading booking" /></>;
  if (!booking) return <><PageHeader crumbs={crumbs} title="Booking" /><LoadError message={loadError || "Booking not found."} onRetry={reload} /></>;

  const hours = (new Date(booking.ends_at).getTime() - new Date(booking.starts_at).getTime()) / 3_600_000;
  const rate = hours > 0 ? toNumber(booking.total_amount) / hours : 0;

  return (
    <>
      <PageHeader crumbs={crumbs} title={<>{booking.court_name} · {formatTime(booking.starts_at)} <BookingBadge status={booking.status} /></>}>
        {NEXT[booking.status].map((action) => (
          <button className={`btn ${action.tone}`} disabled={Boolean(busy)} key={action.status} onClick={() => changeStatus(action.status)} type="button">
            {busy === action.status ? <span className="spinner" /> : null}{action.label}
          </button>
        ))}
      </PageHeader>
      <Notice message={error} />
      <Notice message={message} tone="success" />
      <div className="columns">
        <div className="wide" style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <section className="card padded">
            <div className="formGrid">
              <Fact label="Date" value={formatDate(booking.starts_at, { day: "numeric", month: "short", weekday: "short", year: "numeric" })} />
              <Fact label="Time" value={`${formatTime(booking.starts_at)} – ${formatTime(booking.ends_at)}`} />
              <Fact label="Court" value={booking.court_name} />
              <Fact label="Reference" value={booking.reference} />
            </div>
          </section>
          <section className="card padded">
            <div className="row between" style={{ alignItems: "baseline" }}>
              <h2>Payment</h2>
              <span className="display" style={{ fontSize: 36 }}>{money(booking.total_amount)}</span>
            </div>
            <span className="muted">{hours.toLocaleString("en-IN", { maximumFractionDigits: 1 })} h at {money(rate)} per hour</span>
          </section>
          <section className="card padded">
            <h2>Notes</h2>
            <p className={booking.notes ? undefined : "muted"} style={{ margin: 0, lineHeight: 1.5 }}>{booking.notes || "No notes on this booking."}</p>
          </section>
        </div>
        <div className="narrow" style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <section className="card">
            <div className="who"><Avatar name={booking.customer_name} tone="blu" /><span><strong style={{ fontSize: 16 }}>{booking.customer_name}</strong><small>Customer</small></span></div>
            <a href={`mailto:${booking.customer_email}`}>{booking.customer_email}</a>
            <a href={`tel:${booking.customer_phone}`}>{booking.customer_phone}</a>
            <Link href={`/partner/customers?search=${encodeURIComponent(booking.customer_email)}`} style={{ fontWeight: 800, textDecoration: "none" }}>Open in customers</Link>
          </section>
          <section className="card">
            <h2 style={{ fontSize: 16 }}>Activity</h2>
            <ol className="activity">
              {booking.updated_at !== booking.created_at ? <li><i className="acc" /><span><strong>Status set to {booking.status.toLowerCase()}</strong><small>{formatDate(booking.updated_at)} · {formatTime(booking.updated_at)}</small></span></li> : null}
              <li><i /><span><strong>Booking created</strong><small>{formatDate(booking.created_at)} · {formatTime(booking.created_at)}</small></span></li>
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="field"><span className="fieldLabel">{label}</span><strong style={{ fontSize: 17 }}>{value}</strong></div>;
}
