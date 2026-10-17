// partner/app/partner/(portal)/bookings/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import type { Booking, BookingStatus } from "@pickelton/types";
import { Avatar, BookingBadge, Empty, LoadError, Loading, PageHeader, Segmented } from "../../../../components/ui";
import { formatDate, formatTime, money, partnerApi, toNumber, useResource } from "../../../../lib/partner";

type Tab = "ALL" | BookingStatus;
const PAGE_SIZE = 20;

function exportCsv(rows: Booking[]) {
  const header = ["Reference", "Customer", "Email", "Phone", "Court", "Starts", "Ends", "Amount", "Status"];
  const lines = rows.map((row) => [row.reference, row.customer_name, row.customer_email, row.customer_phone, row.court_name, row.starts_at, row.ends_at, toNumber(row.total_amount), row.status]);
  const csv = [header, ...lines].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = Object.assign(document.createElement("a"), { download: `bookings-${new Date().toISOString().slice(0, 10)}.csv`, href: url });
  link.click();
  URL.revokeObjectURL(url);
}

export default function BookingsPage() {
  const [tab, setTab] = useState<Tab>("ALL");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  // Debounce typing so every keystroke doesn't hit the API.
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(query.trim()); setPage(0); }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, error, loading, reload } = useResource(
    () => partnerApi.bookings.list({ status: tab === "ALL" ? undefined : tab, search: search || undefined, page, size: PAGE_SIZE }),
    [tab, search, page],
  );
  const rows = data?.content ?? [];

  return (
    <>
      <PageHeader sub={data ? `${data.totalElements} booking${data.totalElements === 1 ? "" : "s"}` : undefined} title="Bookings">
        <button className="btn" disabled={!rows.length} onClick={() => exportCsv(rows)} type="button"><Download aria-hidden="true" size={18} />Export CSV</button>
      </PageHeader>
      <div className="row between">
        <Segmented<Tab>
          label="Filter by status"
          onChange={(value) => { setTab(value); setPage(0); }}
          options={[{ label: "All", value: "ALL" }, { label: "Pending", value: "PENDING" }, { label: "Confirmed", value: "CONFIRMED" }, { label: "Completed", value: "COMPLETED" }, { label: "Cancelled", value: "CANCELLED" }]}
          value={tab}
        />
        <label className="searchBox">
          <span className="srOnly">Search bookings</span>
          <Search aria-hidden="true" size={18} />
          <input className="input" onChange={(event) => setQuery(event.target.value)} placeholder="Name, email or booking ID" type="search" value={query} />
        </label>
      </div>

      {loading && !data ? <Loading label="Loading bookings" /> : error && !data ? <LoadError message={error} onRetry={reload} /> : rows.length ? (
        <>
          <div className="tableWrap" aria-busy={loading}>
            <table className="table">
              <thead><tr><th>Booking</th><th>Customer</th><th>Court</th><th>When</th><th className="num">Amount</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td><Link href={`/partner/bookings/${row.id}`}>{row.reference}</Link></td>
                    <td><span className="who"><Avatar name={row.customer_name} /><span><strong>{row.customer_name}</strong><small>{row.customer_email}</small></span></span></td>
                    <td style={{ fontWeight: 700 }}>{row.court_name}</td>
                    <td className="muted" style={{ whiteSpace: "nowrap" }}>{formatDate(row.starts_at)} · {formatTime(row.starts_at)}–{formatTime(row.ends_at)}</td>
                    <td className="amount">{money(row.total_amount)}</td>
                    <td><BookingBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pager">
            <span>Page {data!.page + 1} of {Math.max(data!.totalPages, 1)}</span>
            <div className="row">
              <button className="btn small" disabled={page === 0 || loading} onClick={() => setPage((value) => value - 1)} type="button">Previous</button>
              <button className="btn small" disabled={data!.last || loading} onClick={() => setPage((value) => value + 1)} type="button">Next</button>
            </div>
          </div>
        </>
      ) : <Empty copy={search || tab !== "ALL" ? "No bookings match these filters." : "Bookings from players and walk-ins will appear here."} title="No bookings" />}
    </>
  );
}
