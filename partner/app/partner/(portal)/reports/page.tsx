// partner/app/partner/(portal)/reports/page.tsx
"use client";

import { useState } from "react";
import { Empty, LoadError, Loading, PageHeader, Segmented } from "../../../../components/ui";
import { money, partnerApi, toNumber, useResource } from "../../../../lib/partner";
import "./reports.css";

type Range = "month" | "30" | "90";
const COURT_COLORS = ["var(--acc)", "var(--blu)", "var(--hot)", "var(--acc-ink)", "var(--blu-ink)", "var(--muted)"];

function rangeFor(range: Range) {
  const to = new Date();
  const from = range === "month" ? new Date(to.getFullYear(), to.getMonth(), 1) : new Date(to.getTime() - Number(range) * 86_400_000);
  return { from, to };
}

export default function ReportsPage() {
  const [range, setRange] = useState<Range>("month");
  const { from, to } = rangeFor(range);
  const { data, error, loading, reload } = useResource(() => partnerApi.reports.summary(from.toISOString(), to.toISOString()), [range]);

  const days = data?.byDay ?? [];
  const maxRevenue = Math.max(...days.map((day) => toNumber(day.revenue)), 1);
  const courtTotal = (data?.byCourt ?? []).reduce((sum, court) => sum + toNumber(court.revenue), 0);
  const label = `${from.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${to.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <>
      <PageHeader sub={label} title="Reports">
        <Segmented<Range> label="Date range" onChange={setRange} options={[{ label: "This month", value: "month" }, { label: "30 days", value: "30" }, { label: "90 days", value: "90" }]} value={range} />
        <button className="btn" onClick={() => window.print()} type="button">Print</button>
      </PageHeader>

      {loading && !data ? <Loading label="Crunching the numbers" /> : error && !data ? <LoadError message={error} onRetry={reload} /> : data ? <>
        <div className="statGrid">
          <div className="stat"><span className="label">Revenue</span><span className="value">{money(data.summary.revenue)}</span><span className="hint">Confirmed and completed</span></div>
          <div className="stat"><span className="label">Bookings</span><span className="value">{data.summary.bookings}</span><span className="hint">{days.length ? `${(data.summary.bookings / days.length).toFixed(1)} a day on days with play` : "No bookings yet"}</span></div>
          <div className="stat"><span className="label">Customers</span><span className="value">{data.summary.customers}</span><span className="hint">booked in this range</span></div>
          <div className="stat"><span className="label">Average booking</span><span className="value">{money(data.summary.average_booking_value)}</span><span className="hint">per confirmed booking</span></div>
        </div>

        <section className="card">
          <div className="row between"><h2>Revenue by day</h2><span className="muted">{days.length} day{days.length === 1 ? "" : "s"} with bookings</span></div>
          {days.length ? (
            <div aria-label={`Daily revenue, highest ${money(maxRevenue)}`} className="bars" role="img">
              {days.map((day) => {
                const value = toNumber(day.revenue);
                const date = new Date(day.date);
                return (
                  <div className="barCol" key={day.date} title={`${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}: ${money(value)} · ${day.bookings} bookings`}>
                    <div className="barFill" style={{ height: `${Math.max((value / maxRevenue) * 100, 2)}%` }} />
                    <span className="barLabel">{date.getDate()}</span>
                  </div>
                );
              })}
            </div>
          ) : <Empty copy="No bookings in this range yet." title="Nothing to chart" />}
        </section>

        <section className="card">
          <div className="row between"><h2>Where the money comes from</h2><span className="muted">{money(courtTotal)} across {data.byCourt.length} courts</span></div>
          {courtTotal > 0 ? <>
            <div aria-label={data.byCourt.map((court) => `${court.name} ${Math.round((toNumber(court.revenue) / courtTotal) * 100)} percent`).join(", ")} className="split" role="img">
              {data.byCourt.filter((court) => toNumber(court.revenue) > 0).map((court, index) => <span key={court.id} style={{ background: COURT_COLORS[index % COURT_COLORS.length], width: `${(toNumber(court.revenue) / courtTotal) * 100}%` }} />)}
            </div>
            <div className="splitLegend">
              {data.byCourt.map((court, index) => (
                <span key={court.id}><i style={{ background: COURT_COLORS[index % COURT_COLORS.length] }} /><strong>{court.name}</strong>{money(court.revenue)} · {court.bookings} bookings</span>
              ))}
            </div>
          </> : <p className="muted" style={{ margin: 0 }}>Revenue per court appears once bookings are confirmed.</p>}
        </section>
      </> : null}
    </>
  );
}
