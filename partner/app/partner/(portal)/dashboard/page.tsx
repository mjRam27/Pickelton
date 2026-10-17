// partner/app/partner/(portal)/dashboard/page.tsx
"use client";

import Link from "next/link";
import type { Booking } from "@pickelton/types";
import { usePartner } from "../../../../components/partner/PartnerShell";
import { BookingBadge, Empty, LoadError, Loading, PageHeader } from "../../../../components/ui";
import { formatTime, money, partnerApi, toNumber, useResource } from "../../../../lib/partner";
import "./dashboard.css";

const DAY_START = 6;
const DAY_HOURS = 18; // 06:00 to 24:00

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

function hourOf(value: string) {
  const date = new Date(value);
  return date.getHours() + date.getMinutes() / 60;
}

export default function DashboardPage() {
  const { partner } = usePartner();
  const { data, error, loading, reload } = useResource(async () => {
    const [dashboard, bookings, courts] = await Promise.all([
      partnerApi.dashboard(),
      partnerApi.bookings.list({ size: 100 }),
      partnerApi.courts.list({ size: 100 }),
    ]);
    const today = bookings.content.filter((booking) => isToday(booking.starts_at) && booking.status !== "CANCELLED" && booking.status !== "REJECTED");
    return { dashboard, today, courts: courts.content };
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = partner.contact_name.split(" ")[0];
  const dateLabel = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", weekday: "long", year: "numeric" });

  return (
    <>
      <PageHeader sub={dateLabel} title={`${greeting}, ${firstName}`}>
        <Link className="btn" href="/partner/bookings">All bookings</Link>
        <Link className="btn primary" href="/partner/courts/add">Add court</Link>
      </PageHeader>

      {loading && !data ? <Loading label="Loading today's numbers" /> : error && !data ? <LoadError message={error} onRetry={reload} /> : data ? (() => {
        const { dashboard, today, courts } = data;
        const bookedHours = today.reduce((sum, booking) => sum + (new Date(booking.ends_at).getTime() - new Date(booking.starts_at).getTime()) / 3_600_000, 0);
        const activeCourts = courts.filter((court) => court.status === "ACTIVE").length;
        const utilisation = activeCourts ? Math.min(100, Math.round((bookedHours / (activeCourts * DAY_HOURS)) * 100)) : 0;
        const nowOffset = ((new Date().getHours() + new Date().getMinutes() / 60 - DAY_START) / DAY_HOURS) * 100;
        const byCourt = new Map<string, Booking[]>();
        for (const booking of today) byCourt.set(booking.court_id, [...(byCourt.get(booking.court_id) ?? []), booking]);
        const upcoming = today.filter((booking) => new Date(booking.ends_at).getTime() >= Date.now()).sort((a, b) => a.starts_at.localeCompare(b.starts_at)).slice(0, 6);

        return <>
          <div className="statGrid">
            <div className="stat accent"><span className="label">Revenue this month</span><span className="value">{money(dashboard.metrics.revenue_month)}</span><span className="hint">Confirmed and completed bookings</span></div>
            <div className="stat"><span className="label">Bookings today</span><span className="value">{dashboard.metrics.bookings_today}</span><span className="hint" style={{ color: "var(--acc-ink)" }}>{dashboard.metrics.pending_bookings} waiting for confirmation</span></div>
            <div className="stat"><span className="label">Court utilisation today</span><span className="value">{utilisation}%</span><div className="bar"><span style={{ width: `${utilisation}%` }} /></div></div>
            <div className="stat"><span className="label">Customers</span><span className="value">{dashboard.metrics.total_customers}</span><span className="hint">have booked with you</span></div>
          </div>

          <div className="columns">
            <section className="card wide">
              <div className="row between">
                <h2>Today on court</h2>
                <div className="row legend"><span><i className="acc" />Pickleball</span><span><i className="blu" />Badminton</span><span><i className="hot" />Multi-sport</span></div>
              </div>
              {courts.length ? (
                <div className="timelineScroll">
                  <div className="timeline">
                    <div className="timelineRow head"><span /><div className="hours">{[6, 9, 12, 15, 18, 21, 24].map((h) => <span key={h}>{String(h % 24).padStart(2, "0")}</span>)}</div></div>
                    {courts.map((court) => (
                      <div className="timelineRow" key={court.id}>
                        <span className="courtName">{court.name}</span>
                        <div className="track">
                          {(byCourt.get(court.id) ?? []).map((booking) => {
                            const start = Math.max(hourOf(booking.starts_at), DAY_START);
                            const end = Math.min(hourOf(booking.ends_at) || 24, 24);
                            return (
                              <Link className={`block ${court.sport === "BADMINTON" ? "blu" : court.sport === "MULTI_SPORT" ? "hot" : "acc"}`} href={`/partner/bookings/${booking.id}`} key={booking.id} style={{ left: `${((start - DAY_START) / DAY_HOURS) * 100}%`, width: `calc(${((end - start) / DAY_HOURS) * 100}% - 3px)` }} title={`${booking.customer_name} · ${formatTime(booking.starts_at)}–${formatTime(booking.ends_at)}`}>
                                {booking.customer_name}
                              </Link>
                            );
                          })}
                          {nowOffset > 0 && nowOffset < 100 ? <span aria-hidden="true" className="now" style={{ left: `${nowOffset}%` }} /> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <Empty action={<Link className="btn primary" href="/partner/courts/add">Add your first court</Link>} copy="Add a court to start taking bookings." title="No courts yet" />}
            </section>

            <section className="card narrow">
              <div className="row between"><h2>Next check-ins</h2><Link className="small" href="/partner/bookings">View all</Link></div>
              {upcoming.length ? upcoming.map((booking) => (
                <Link className="checkin" href={`/partner/bookings/${booking.id}`} key={booking.id}>
                  <span className="checkinTime">{formatTime(booking.starts_at)}</span>
                  <span className="checkinWho"><strong>{booking.customer_name}</strong><small>{booking.court_name} · {booking.reference}</small></span>
                  <span className="checkinPrice">{money(booking.total_amount)}</span>
                </Link>
              )) : <p className="muted" style={{ margin: 0 }}>No more bookings today.</p>}
            </section>
          </div>

          <section className="card">
            <div className="row between"><h2>Latest bookings</h2><span className="muted">Last 7 days: {money(dashboard.revenue.reduce((sum, day) => sum + toNumber(day.revenue), 0))}</span></div>
            {dashboard.recentBookings.length ? (
              <div className="recent">
                {dashboard.recentBookings.map((booking) => (
                  <Link className="recentRow" href={`/partner/bookings/${booking.id}`} key={booking.id}>
                    <strong>{booking.reference}</strong>
                    <span>{booking.customer_name}</span>
                    <span className="muted">{booking.court_name} · {new Date(booking.starts_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} {formatTime(booking.starts_at)}</span>
                    <span className="amount">{money(booking.total_amount)}</span>
                    <BookingBadge status={booking.status} />
                  </Link>
                ))}
              </div>
            ) : <p className="muted" style={{ margin: 0 }}>Bookings will show up here as they come in.</p>}
          </section>
        </>;
      })() : null}
    </>
  );
}
