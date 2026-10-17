// partner/app/partner/(portal)/customers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Mail, Search } from "lucide-react";
import { Avatar, Empty, LoadError, Loading, PageHeader } from "../../../../components/ui";
import { formatDate, money, partnerApi, useResource } from "../../../../lib/partner";

const PAGE_SIZE = 20;
const LAPSING_DAYS = 45;

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  // Booking detail links here with ?search=<email>.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("search");
    if (initial) setQuery(initial);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(query.trim()); setPage(0); }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, error, loading, reload } = useResource(() => partnerApi.customers.list({ search: search || undefined, page, size: PAGE_SIZE }), [search, page]);
  const rows = data?.content ?? [];

  return (
    <>
      <PageHeader sub={data ? `${data.totalElements} ${data.totalElements === 1 ? "player has" : "players have"} booked with you` : undefined} title="Customers" />
      <label className="searchBox" style={{ maxWidth: 420 }}>
        <span className="srOnly">Search customers</span>
        <Search aria-hidden="true" size={18} />
        <input className="input" onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email or phone" type="search" value={query} />
      </label>

      {loading && !data ? <Loading label="Loading customers" /> : error && !data ? <LoadError message={error} onRetry={reload} /> : rows.length ? (
        <>
          <div aria-busy={loading} className="tableWrap">
            <table className="table">
              <thead><tr><th>Customer</th><th>Phone</th><th className="num">Visits</th><th>Last visit</th><th className="num">Spend</th><th><span className="srOnly">Actions</span></th></tr></thead>
              <tbody>
                {rows.map((row) => {
                  const lapsing = row.last_booking_at ? Date.now() - new Date(row.last_booking_at).getTime() > LAPSING_DAYS * 86_400_000 : false;
                  return (
                    <tr key={row.id}>
                      <td><span className="who"><Avatar name={row.name} tone={row.booking_count >= 4 ? "blu" : undefined} /><span><strong>{row.name}</strong><small>{row.email}</small></span></span></td>
                      <td className="muted">{row.phone}</td>
                      <td className="amount">{row.booking_count}</td>
                      <td style={{ color: lapsing ? "var(--hot-ink)" : "var(--muted)", fontWeight: 600 }}>{row.last_booking_at ? formatDate(row.last_booking_at, { day: "numeric", month: "short", year: "numeric" }) : "–"}</td>
                      <td className="amount">{money(row.total_spent)}</td>
                      <td style={{ textAlign: "right" }}><a aria-label={`Email ${row.name}`} className="btn small" href={`mailto:${row.email}`}><Mail aria-hidden="true" size={16} /></a></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pager">
            <span>Page {data!.page + 1} of {Math.max(data!.totalPages, 1)} · last visit in orange means more than {LAPSING_DAYS} days ago</span>
            <div className="row">
              <button className="btn small" disabled={page === 0 || loading} onClick={() => setPage((value) => value - 1)} type="button">Previous</button>
              <button className="btn small" disabled={data!.last || loading} onClick={() => setPage((value) => value + 1)} type="button">Next</button>
            </div>
          </div>
        </>
      ) : <Empty copy={search ? "No customers match that search." : "Customers appear here after their first booking."} title="No customers yet" />}
    </>
  );
}
