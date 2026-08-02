"use client";

import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  Filter,
  IndianRupee,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserCheck,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import "./page.css";

type BookingStatus = "Confirmed" | "Pending" | "Cancelled";
type PaymentStatus = "Paid" | "Pending" | "Refunded";
type SortDirection = "asc" | "desc";
type SortKey =
  | "id"
  | "customer"
  | "court"
  | "date"
  | "time"
  | "status"
  | "paymentStatus"
  | "amount";

interface Booking {
  id: string;
  customer: string;
  court: string;
  date: string;
  displayDate: string;
  time: string;
  duration: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number;
}

interface Filters {
  search: string;
  court: string;
  customer: string;
  status: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
}

const bookings: Booking[] = [
  {
    id: "BKG-1024",
    customer: "Aarav Sharma",
    court: "Centre Court",
    date: "2026-07-22",
    displayDate: "22 Jul 2026",
    time: "9:00 AM – 10:00 AM",
    duration: "1 hour",
    status: "Confirmed",
    paymentStatus: "Paid",
    amount: 1200,
  },
  {
    id: "BKG-1025",
    customer: "Meera Kapoor",
    court: "Court 2",
    date: "2026-07-22",
    displayDate: "22 Jul 2026",
    time: "11:30 AM – 12:30 PM",
    duration: "1 hour",
    status: "Pending",
    paymentStatus: "Pending",
    amount: 900,
  },
  {
    id: "BKG-1026",
    customer: "Rohan Verma",
    court: "Court 1",
    date: "2026-07-23",
    displayDate: "23 Jul 2026",
    time: "4:00 PM – 5:00 PM",
    duration: "1 hour",
    status: "Confirmed",
    paymentStatus: "Paid",
    amount: 1000,
  },
  {
    id: "BKG-1027",
    customer: "Ishita Rao",
    court: "Court 3",
    date: "2026-07-23",
    displayDate: "23 Jul 2026",
    time: "6:30 PM – 7:30 PM",
    duration: "1 hour",
    status: "Cancelled",
    paymentStatus: "Refunded",
    amount: 1100,
  },
  {
    id: "BKG-1028",
    customer: "Kabir Singh",
    court: "Centre Court",
    date: "2026-07-24",
    displayDate: "24 Jul 2026",
    time: "8:00 AM – 9:00 AM",
    duration: "1 hour",
    status: "Confirmed",
    paymentStatus: "Paid",
    amount: 1200,
  },
  {
    id: "BKG-1029",
    customer: "Ananya Mehta",
    court: "Court 2",
    date: "2026-07-24",
    displayDate: "24 Jul 2026",
    time: "2:00 PM – 3:00 PM",
    duration: "1 hour",
    status: "Pending",
    paymentStatus: "Pending",
    amount: 900,
  },
];

const initialFilters: Filters = {
  search: "",
  court: "",
  customer: "",
  status: "",
  paymentStatus: "",
  dateFrom: "",
  dateTo: "",
};

const timeline = [
  {
    time: "08:00",
    meridiem: "AM",
    customer: "Kabir Singh",
    court: "Centre Court",
    state: "checked-in",
    label: "Checked in",
  },
  {
    time: "09:00",
    meridiem: "AM",
    customer: "Aarav Sharma",
    court: "Centre Court",
    state: "playing",
    label: "Playing now",
  },
  {
    time: "11:30",
    meridiem: "AM",
    customer: "Meera Kapoor",
    court: "Court 2",
    state: "upcoming",
    label: "Upcoming",
  },
  {
    time: "02:00",
    meridiem: "PM",
    customer: "Ananya Mehta",
    court: "Court 2",
    state: "pending",
    label: "Pending",
  },
];

const activities = [
  {
    title: "Booking confirmed",
    detail: "Aarav Sharma · Centre Court",
    time: "8 min ago",
    tone: "success",
  },
  {
    title: "Customer checked in",
    detail: "Kabir Singh · Centre Court",
    time: "16 min ago",
    tone: "playing",
  },
  {
    title: "Payment awaiting collection",
    detail: "Meera Kapoor · ₹900",
    time: "24 min ago",
    tone: "warning",
  },
  {
    title: "Booking cancelled",
    detail: "Ishita Rao · Court 3",
    time: "1 hr ago",
    tone: "danger",
  },
];

const heatmap = [
  [1, 1, 2, 2, 2, 3, 2],
  [1, 2, 2, 3, 3, 4, 3],
  [2, 2, 3, 3, 4, 4, 3],
  [2, 3, 4, 4, 5, 5, 4],
  [1, 2, 3, 3, 4, 4, 3],
];

const PAGE_SIZE = 4;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusClass(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function getSortValue(booking: Booking, key: SortKey) {
  return key === "amount" ? booking.amount : booking[key].toLowerCase();
}

function escapeCsv(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function BookingSkeleton() {
  return (
    <div className="booking-grid bookings-skeleton" aria-label="Loading bookings">
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <article className="booking-skeleton" key={index}>
          <div className="skeleton-row">
            <i className="skeleton-avatar" />
            <span />
          </div>
          <span />
          <span />
          <div className="skeleton-panel" />
          <div className="skeleton-actions" />
        </article>
      ))}
    </div>
  );
}

export default function BookingsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const isLoading = false;

  const courts = useMemo(
    () => [...new Set(bookings.map((booking) => booking.court))].sort(),
    [],
  );

  const customers = useMemo(
    () =>
      [...new Set(bookings.map((booking) => booking.customer))].sort(),
    [],
  );

  const summary = useMemo(
    () => ({
      total: bookings.length,
      confirmed: bookings.filter(
        (booking) => booking.status === "Confirmed",
      ).length,
      pending: bookings.filter(
        (booking) => booking.status === "Pending",
      ).length,
      cancelled: bookings.filter(
        (booking) => booking.status === "Cancelled",
      ).length,
      revenue: bookings
        .filter((booking) => booking.paymentStatus === "Paid")
        .reduce((total, booking) => total + booking.amount, 0),
    }),
    [],
  );

  const filteredBookings = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        const matchesSearch =
          !search ||
          booking.id.toLowerCase().includes(search) ||
          booking.customer.toLowerCase().includes(search) ||
          booking.court.toLowerCase().includes(search);

        return (
          matchesSearch &&
          (!filters.court || booking.court === filters.court) &&
          (!filters.customer ||
            booking.customer === filters.customer) &&
          (!filters.status || booking.status === filters.status) &&
          (!filters.paymentStatus ||
            booking.paymentStatus === filters.paymentStatus) &&
          (!filters.dateFrom || booking.date >= filters.dateFrom) &&
          (!filters.dateTo || booking.date <= filters.dateTo)
        );
      })
      .sort((first, second) => {
        const firstValue = getSortValue(first, sortKey);
        const secondValue = getSortValue(second, sortKey);

        if (firstValue < secondValue) {
          return sortDirection === "asc" ? -1 : 1;
        }

        if (firstValue > secondValue) {
          return sortDirection === "asc" ? 1 : -1;
        }

        return 0;
      });
  }, [filters, sortDirection, sortKey]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / PAGE_SIZE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedBookings = filteredBookings.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  );

  const activeFilters = [
    filters.search
      ? {
          key: "search" as keyof Filters,
          label: `Search: ${filters.search}`,
        }
      : null,
    filters.court
      ? { key: "court" as keyof Filters, label: filters.court }
      : null,
    filters.customer
      ? { key: "customer" as keyof Filters, label: filters.customer }
      : null,
    filters.status
      ? {
          key: "status" as keyof Filters,
          label: `Status: ${filters.status}`,
        }
      : null,
    filters.paymentStatus
      ? {
          key: "paymentStatus" as keyof Filters,
          label: `Payment: ${filters.paymentStatus}`,
        }
      : null,
    filters.dateFrom
      ? {
          key: "dateFrom" as keyof Filters,
          label: `From: ${filters.dateFrom}`,
        }
      : null,
    filters.dateTo
      ? {
          key: "dateTo" as keyof Filters,
          label: `To: ${filters.dateTo}`,
        }
      : null,
  ].filter(Boolean) as Array<{ key: keyof Filters; label: string }>;

  function updateFilter<Key extends keyof Filters>(
    key: Key,
    value: Filters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);
  }

  function clearFilter(key: keyof Filters) {
    updateFilter(key, "");
  }

  function clearAllFilters() {
    setFilters(initialFilters);
    setCurrentPage(1);
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  }

  function exportBookings() {
    const header = [
      "Booking ID",
      "Customer",
      "Court",
      "Date",
      "Time",
      "Duration",
      "Booking Status",
      "Payment Status",
      "Amount",
    ];

    const rows = filteredBookings.map((booking) => [
      booking.id,
      booking.customer,
      booking.court,
      booking.displayDate,
      booking.time,
      booking.duration,
      booking.status,
      booking.paymentStatus,
      booking.amount,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "pickelton-bookings.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function renderSortIcon(key: SortKey) {
    if (sortKey !== key) return null;

    return sortDirection === "asc" ? (
      <ArrowUp size={13} aria-hidden="true" />
    ) : (
      <ArrowDown size={13} aria-hidden="true" />
    );
  }

  return (
    <main className="bookings-page">
      <section className="bookings-hero">
        <div className="hero-decoration hero-decoration-large" />
        <div className="hero-decoration hero-decoration-small" />

        <div className="hero-main">
          <div className="hero-content">
            <div>
              <span className="page-eyebrow">BOOKING OPERATIONS</span>
              <h1>Bookings</h1>
              <p>
                Manage reservations, arrivals and payments from one
                operational workspace.
              </p>
            </div>

            <Link href="/partner/bookings/add" className="primary-action">
              <Plus size={18} aria-hidden="true" />
              New Booking
            </Link>
          </div>

          <div className="hero-controls">
            <label className="hero-search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={filters.search}
                onChange={(event) =>
                  updateFilter("search", event.target.value)
                }
                placeholder="Search bookings..."
                aria-label="Search bookings"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => clearFilter("search")}
                  aria-label="Clear search"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </label>

            <label className="hero-date">
              <CalendarDays size={17} aria-hidden="true" />
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(event) =>
                  updateFilter("dateFrom", event.target.value)
                }
                aria-label="Filter from date"
              />
            </label>
          </div>

          <div className="hero-filter-chips">
            {["", "Confirmed", "Pending", "Cancelled"].map((status) => (
              <button
                type="button"
                className={filters.status === status ? "active" : ""}
                onClick={() => updateFilter("status", status)}
                key={status || "all"}
              >
                {status || "All Bookings"}
              </button>
            ))}
          </div>

          <div className="hero-kpis">
            <article>
              <span>Today&apos;s bookings</span>
              <strong>{summary.total}</strong>
              <small>Across 4 courts</small>
            </article>
            <article>
              <span>Active</span>
              <strong>{summary.confirmed}</strong>
              <small>Ready for play</small>
            </article>
            <article>
              <span>Upcoming</span>
              <strong>{summary.pending}</strong>
              <small>Need confirmation</small>
            </article>
            <article>
              <span>Cancelled</span>
              <strong>{summary.cancelled}</strong>
              <small>Current period</small>
            </article>
          </div>
        </div>

        <aside className="hero-overview">
          <div className="hero-overview-head">
            <div>
              <span>Revenue today</span>
              <strong>{formatCurrency(summary.revenue)}</strong>
            </div>
            <span className="hero-trend">
              <TrendingUp size={13} />
              12.4%
            </span>
          </div>

          <div className="hero-overview-stat">
            <div>
              <span>Court occupancy</span>
              <strong>78%</strong>
            </div>
            <div className="hero-progress">
              <i />
            </div>
          </div>

          <div className="hero-overview-grid">
            <article>
              <Clock3 size={17} />
              <span>Peak hours</span>
              <strong>6–8 PM</strong>
            </article>
            <article>
              <UserCheck size={17} />
              <span>Check-ins</span>
              <strong>18 / 24</strong>
            </article>
          </div>

          <div className="hero-health">
            <CheckCircle2 size={18} />
            <div>
              <strong>Schedule on track</strong>
              <span>Next arrival in 24 minutes</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="booking-kpis">
        {[
          {
            label: "Total Bookings",
            value: summary.total,
            note: "Current period",
            icon: CalendarDays,
            trend: "+8.4%",
          },
          {
            label: "Confirmed",
            value: summary.confirmed,
            note: "Ready for arrival",
            icon: CheckCircle2,
            trend: "50%",
          },
          {
            label: "Revenue Today",
            value: formatCurrency(summary.revenue),
            note: "Paid bookings",
            icon: IndianRupee,
            trend: "+12.4%",
          },
          {
            label: "Court Occupancy",
            value: "78%",
            note: "Across all courts",
            icon: TrendingUp,
            trend: "+6.2%",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article className="kpi-card" key={item.label}>
              <div className="kpi-card-top">
                <span className="kpi-icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="kpi-trend">{item.trend}</span>
              </div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className="timeline-insights-grid">
        <article className="timeline-card">
          <header className="section-heading">
            <div>
              <span className="page-eyebrow">TODAY&apos;S FLOW</span>
              <h2>Booking Timeline</h2>
              <p>Live arrivals and reservations for today</p>
            </div>
            <button type="button" className="date-button">
              <CalendarDays size={15} />
              22 July
            </button>
          </header>

          <div className="timeline-list">
            {timeline.map((item) => (
              <article className={`timeline-item ${item.state}`} key={item.time}>
                <div className="timeline-time">
                  <strong>{item.time}</strong>
                  <span>{item.meridiem}</span>
                </div>

                <span className="timeline-marker" />

                <div className="timeline-customer">
                  <span className="mini-avatar">
                    {initials(item.customer)}
                  </span>
                  <div>
                    <strong>{item.customer}</strong>
                    <span>{item.court}</span>
                  </div>
                </div>

                <span className={`timeline-state ${item.state}`}>
                  {item.label}
                </span>
              </article>
            ))}
          </div>
        </article>

        <aside className="live-overview-card">
          <header>
            <div>
              <span className="page-eyebrow">LIVE OVERVIEW</span>
              <h2>Operations Pulse</h2>
            </div>
            <span className="live-badge">Live</span>
          </header>

          <div className="live-metric">
            <div>
              <span>Courts in play</span>
              <strong>3 of 4</strong>
            </div>
            <div className="metric-progress">
              <i />
            </div>
          </div>

          <div className="live-grid">
            <article>
              <UserCheck size={17} />
              <strong>18</strong>
              <span>Checked in</span>
            </article>
            <article>
              <Clock3 size={17} />
              <strong>2</strong>
              <span>Awaiting</span>
            </article>
            <article>
              <CreditCard size={17} />
              <strong>1</strong>
              <span>Payment due</span>
            </article>
            <article>
              <MapPin size={17} />
              <strong>24m</strong>
              <span>Next arrival</span>
            </article>
          </div>

          <div className="live-alert">
            <Sparkles size={17} />
            <div>
              <strong>Peak demand starts at 6 PM</strong>
              <span>92% occupancy expected this evening</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="booking-workspace">
        <header className="workspace-heading">
          <div>
            <span className="page-eyebrow">RESERVATIONS</span>
            <h2>Booking Management</h2>
            <p>Review customers, schedules, payments and booking status.</p>
          </div>

          <div className="workspace-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={exportBookings}
              disabled={filteredBookings.length === 0}
            >
              <Download size={16} />
              Export
            </button>
            <Link href="/partner/bookings/add" className="compact-primary">
              <Plus size={16} />
              New Booking
            </Link>
          </div>
        </header>

        <div className="booking-controls">
          <label className="booking-search">
            <Search size={17} />
            <input
              type="search"
              value={filters.search}
              onChange={(event) =>
                updateFilter("search", event.target.value)
              }
              placeholder="Search ID, customer or court..."
              aria-label="Search booking records"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => clearFilter("search")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>

          <select
            value={filters.status}
            onChange={(event) =>
              updateFilter("status", event.target.value)
            }
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={filters.court}
            onChange={(event) =>
              updateFilter("court", event.target.value)
            }
            aria-label="Filter by court"
          >
            <option value="">All courts</option>
            {courts.map((court) => (
              <option value={court} key={court}>
                {court}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={`filter-button ${
              showAdvancedFilters ? "active" : ""
            }`}
            onClick={() =>
              setShowAdvancedFilters((current) => !current)
            }
            aria-expanded={showAdvancedFilters}
          >
            <SlidersHorizontal size={16} />
            More Filters
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="advanced-filters">
            <label>
              <span>Customer</span>
              <select
                value={filters.customer}
                onChange={(event) =>
                  updateFilter("customer", event.target.value)
                }
              >
                <option value="">All customers</option>
                {customers.map((customer) => (
                  <option value={customer} key={customer}>
                    {customer}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Payment status</span>
              <select
                value={filters.paymentStatus}
                onChange={(event) =>
                  updateFilter("paymentStatus", event.target.value)
                }
              >
                <option value="">All payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
              </select>
            </label>

            <label>
              <span>Date from</span>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(event) =>
                  updateFilter("dateFrom", event.target.value)
                }
              />
            </label>

            <label>
              <span>Date to</span>
              <input
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={(event) =>
                  updateFilter("dateTo", event.target.value)
                }
              />
            </label>
          </div>
        )}

        {activeFilters.length > 0 && (
          <div className="active-filters">
            <span>Active filters</span>
            <div>
              {activeFilters.map((filter) => (
                <button
                  type="button"
                  onClick={() => clearFilter(filter.key)}
                  key={filter.key}
                >
                  {filter.label}
                  <X size={12} />
                </button>
              ))}
            </div>
            <button type="button" onClick={clearAllFilters}>
              Clear all
            </button>
          </div>
        )}

        <div className="records-heading">
          <div>
            <strong>
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "booking" : "bookings"}
            </strong>
            <span>
              {activeFilters.length
                ? "Matching the current filters"
                : "All reservation records"}
            </span>
          </div>

          <div className="sort-buttons">
            <span>Sort</span>
            {[
              ["date", "Date"],
              ["customer", "Customer"],
              ["amount", "Amount"],
              ["status", "Status"],
            ].map(([key, label]) => (
              <button
                type="button"
                className={sortKey === key ? "active" : ""}
                onClick={() => handleSort(key as SortKey)}
                key={key}
              >
                {label}
                {renderSortIcon(key as SortKey)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <BookingSkeleton />
        ) : paginatedBookings.length === 0 ? (
          <div className="empty-state">
            <span>
              <Search size={24} />
            </span>
            <h3>No bookings found</h3>
            <p>No reservations match the current search and filters.</p>
            <button type="button" onClick={clearAllFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="booking-grid">
              {paginatedBookings.map((booking) => (
                <article className="booking-card" key={booking.id}>
                  <header className="booking-card-header">
                    <div className="customer-profile">
                      <span className="customer-avatar">
                        {initials(booking.customer)}
                      </span>
                      <div>
                        <span className="booking-id">{booking.id}</span>
                        <h3>{booking.customer}</h3>
                        <span className="court-name">
                          <MapPin size={12} />
                          {booking.court}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="more-button"
                      aria-label={`More actions for ${booking.id}`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </header>

                  <div className="booking-date-panel">
                    <span className="calendar-icon">
                      <CalendarDays size={20} />
                    </span>
                    <div>
                      <span>{booking.displayDate}</span>
                      <strong>{booking.time}</strong>
                    </div>
                    <span className="duration">
                      <Clock3 size={13} />
                      {booking.duration}
                    </span>
                  </div>

                  <div className="booking-status-row">
                    <span
                      className={`status-badge ${statusClass(
                        booking.status,
                      )}`}
                    >
                      <i />
                      {booking.status}
                    </span>
                    <span
                      className={`payment-badge ${statusClass(
                        booking.paymentStatus,
                      )}`}
                    >
                      <CreditCard size={12} />
                      {booking.paymentStatus}
                    </span>
                  </div>

                  <div className="booking-metrics">
                    <div>
                      <span>Amount</span>
                      <strong>{formatCurrency(booking.amount)}</strong>
                    </div>
                    <div>
                      <span>Arrival</span>
                      <strong>
                        {booking.status === "Confirmed"
                          ? "On schedule"
                          : booking.status === "Pending"
                            ? "Awaiting"
                            : "Cancelled"}
                      </strong>
                    </div>
                  </div>

                  <footer className="booking-card-footer">
                    <div className="readiness">
                      <CheckCircle2 size={15} />
                      <span>
                        {booking.status === "Confirmed"
                          ? "Ready for check-in"
                          : booking.status === "Pending"
                            ? "Needs confirmation"
                            : "No action required"}
                      </span>
                    </div>

                    <Link href={`/partner/bookings/${booking.id}`}>
                      View Details
                      <ChevronRight size={15} />
                    </Link>
                  </footer>
                </article>
              ))}
            </div>

            <footer className="pagination">
              <p>
                Showing {pageStart + 1}–
                {Math.min(
                  pageStart + PAGE_SIZE,
                  filteredBookings.length,
                )}{" "}
                of {filteredBookings.length}
              </p>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((current) =>
                      Math.max(1, current - 1),
                    )
                  }
                  disabled={safeCurrentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      type="button"
                      className={
                        page === safeCurrentPage ? "active" : ""
                      }
                      onClick={() => setCurrentPage(page)}
                      aria-current={
                        page === safeCurrentPage ? "page" : undefined
                      }
                      key={page}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((current) =>
                      Math.min(totalPages, current + 1),
                    )
                  }
                  disabled={safeCurrentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

      <section className="analytics-layout">
        <article className="revenue-card">
          <header className="section-heading">
            <div>
              <span className="page-eyebrow">REVENUE</span>
              <h2>Booking Performance</h2>
              <p>Revenue generated during the current week</p>
            </div>
            <span className="positive-chip">
              <TrendingUp size={13} />
              12.4%
            </span>
          </header>

          <div className="revenue-summary">
            <div>
              <span>Total revenue</span>
              <strong>₹1,24,800</strong>
            </div>
            <div>
              <span>Average booking</span>
              <strong>₹1,040</strong>
            </div>
            <div>
              <span>Cancellation rate</span>
              <strong>4.2%</strong>
            </div>
          </div>

          <div className="revenue-chart">
            {[48, 62, 54, 76, 68, 94, 83].map((height, index) => (
              <div className="chart-column" key={`${height}-${index}`}>
                <span
                  className={index === 5 ? "peak" : ""}
                  style={{ height: `${height}%` }}
                />
                <small>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                    index
                  ]}
                </small>
              </div>
            ))}
          </div>
        </article>

        <article className="heatmap-card">
          <header className="section-heading">
            <div>
              <span className="page-eyebrow">DEMAND</span>
              <h2>Booking Heatmap</h2>
              <p>Demand by hour and day</p>
            </div>
          </header>

          <div className="heatmap-labels">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day) => (
                <span key={day}>{day}</span>
              ),
            )}
          </div>

          <div className="heatmap-grid">
            {heatmap.flatMap((row, rowIndex) =>
              row.map((level, columnIndex) => (
                <span
                  className={`heat-level-${level}`}
                  key={`${rowIndex}-${columnIndex}`}
                  title={`Demand level ${level}`}
                />
              )),
            )}
          </div>

          <div className="heatmap-footer">
            <span>Low</span>
            <div>
              {[1, 2, 3, 4, 5].map((level) => (
                <i className={`heat-level-${level}`} key={level} />
              ))}
            </div>
            <span>High</span>
          </div>

          <div className="peak-insight">
            <Clock3 size={18} />
            <div>
              <strong>6–8 PM is the busiest window</strong>
              <span>Friday and Saturday drive peak demand</span>
            </div>
          </div>
        </article>
      </section>

      <section className="activity-summary-grid">
        <article className="activity-card">
          <header className="section-heading">
            <div>
              <span className="page-eyebrow">ACTIVITY</span>
              <h2>Recent Updates</h2>
            </div>
            <span className="section-icon">
              <Clock3 size={18} />
            </span>
          </header>

          <ol className="activity-list">
            {activities.map((activity) => (
              <li className={activity.tone} key={activity.title}>
                <span className="activity-dot" />
                <div>
                  <strong>{activity.title}</strong>
                  <p>{activity.detail}</p>
                </div>
                <time>{activity.time}</time>
              </li>
            ))}
          </ol>
        </article>

        <article className="payment-card">
          <header className="section-heading">
            <div>
              <span className="page-eyebrow">PAYMENTS</span>
              <h2>Payment Summary</h2>
            </div>
            <span className="section-icon">
              <CreditCard size={18} />
            </span>
          </header>

          <div className="payment-total">
            <div>
              <span>Collected today</span>
              <strong>₹3,400</strong>
            </div>
            <span className="positive-chip">85% paid</span>
          </div>

          <div className="payment-progress">
            <i />
          </div>

          <div className="payment-breakdown">
            {[
              ["Paid", "₹3,400", "paid"],
              ["Pending", "₹1,800", "pending"],
              ["Refunded", "₹1,100", "refunded"],
              ["Failed", "₹0", "failed"],
            ].map(([label, value, tone]) => (
              <article key={label}>
                <span className={`payment-dot ${tone}`} />
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="customer-insights-card">
          <header className="section-heading">
            <div>
              <span className="page-eyebrow">CUSTOMERS</span>
              <h2>Booking Audience</h2>
            </div>
            <span className="section-icon">
              <UsersRound size={18} />
            </span>
          </header>

          <div className="audience-ring">
            <div>
              <strong>68%</strong>
              <span>Returning</span>
            </div>
          </div>

          <dl className="audience-metrics">
            <div>
              <dt>New customers</dt>
              <dd>28</dd>
            </div>
            <div>
              <dt>VIP members</dt>
              <dd>12</dd>
            </div>
            <div>
              <dt>Most frequent</dt>
              <dd>Aarav Sharma</dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}