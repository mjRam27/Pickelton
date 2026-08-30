"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  IndianRupee,
  MapPin,
  Plus,
  SlidersHorizontal,
  TrendingUp,
  UserCheck,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase/client";
import PartnerSelect from "@/components/partner/PartnerSelect";
import {
  formatPartnerDate as formatDate,
  formatPartnerTime as formatTime,
  formatPartnerTimeRange as formatTimeRange,
} from "@/lib/partner-date";

import "./page.css";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

interface Booking {
  id: string;
  partner_id: string;
  court_id: string;
  customer_id: string;
  reference: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;

  court?: {
    id?: string;
    name?: string;
    title?: string;
  } | null;

  customer?: {
    id?: string;
    name?: string;
    full_name?: string;
    phone?: string;
    email?: string;
  } | null;
}

interface Filters {
  court: string;
  customer: string;
  status: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
}

const PAGE_SIZE = 6;

const initialFilters: Filters = {
  court: "",
  customer: "",
  status: "",
  paymentStatus: "",
  dateFrom: "",
  dateTo: "",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDuration(start: string, end: string) {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  const minutes = Math.max(
    0,
    Math.round((endTime - startTime) / 60000),
  );

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (remaining === 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  return `${hours}h ${remaining}m`;
}

function getCustomerName(booking: Booking) {
  return (
    booking.customer?.name ||
    booking.customer?.full_name ||
    "Customer"
  );
}

function getCourtName(booking: Booking) {
  return (
    booking.court?.name ||
    booking.court?.title ||
    "Court"
  );
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CU"
  );
}

function statusClass(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function BookingSkeleton() {
  return (
    <div
      className="booking-grid bookings-skeleton"
      aria-label="Loading bookings"
    >
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
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [filters, setFilters] =
    useState<Filters>(initialFilters);

  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  async function loadBookings() {
    try {
      setIsLoading(true);
      setError("");

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "You are not logged in. Please login again.",
        );
      }

      const { data: partner, error: partnerError } =
        await supabase
          .from("partners")
          .select("id")
          .eq("email", user.email)
          .single();

      if (partnerError) {
        throw new Error(
          `Could not find partner account: ${partnerError.message}`,
        );
      }

      const { data, error: bookingsError } =
        await supabase
          .from("bookings")
          .select(
            `
              id,
              partner_id,
              court_id,
              customer_id,
              reference,
              starts_at,
              ends_at,
              status,
              payment_status,
              total_amount,
              notes,
              created_at,
              updated_at,
              courts (
                id,
                name
              ),
              customers (
                id,
                name,
                phone,
                email
              )
            `,
          )
          .eq("partner_id", partner.id)
          .order("starts_at", {
            ascending: true,
          });

      if (bookingsError) {
        throw new Error(bookingsError.message);
      }

      const normalized: Booking[] =
        (data || []).map((item: any) => {
          const court =
            Array.isArray(item.courts)
              ? item.courts[0]
              : item.courts;

          const customer =
            Array.isArray(item.customers)
              ? item.customers[0]
              : item.customers;

          return {
            id: item.id,
            partner_id: item.partner_id,
            court_id: item.court_id,
            customer_id: item.customer_id,
            reference: item.reference,
            starts_at: item.starts_at,
            ends_at: item.ends_at,
            status: item.status,
            payment_status: item.payment_status,
            total_amount: Number(item.total_amount || 0),
            notes: item.notes,
            created_at: item.created_at,
            updated_at: item.updated_at,
            court,
            customer,
          };
        }) || [];

      setBookings(normalized);
    } catch (err) {
      console.error("Bookings error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load bookings.",
      );

      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const courts = useMemo(() => {
    return [
      ...new Set(
        bookings
          .map((booking) => getCourtName(booking))
          .filter(Boolean),
      ),
    ].sort();
  }, [bookings]);

  const customers = useMemo(() => {
    return [
      ...new Set(
        bookings
          .map((booking) => getCustomerName(booking))
          .filter(Boolean),
      ),
    ].sort();
  }, [bookings]);

  const summary = useMemo(() => {
    const paidRevenue = bookings
      .filter(
        (booking) =>
          booking.payment_status === "PAID",
      )
      .reduce(
        (total, booking) =>
          total + Number(booking.total_amount || 0),
        0,
      );

    return {
      total: bookings.length,

      confirmed: bookings.filter(
        (booking) =>
          booking.status === "CONFIRMED",
      ).length,

      pending: bookings.filter(
        (booking) =>
          booking.status === "PENDING",
      ).length,

      completed: bookings.filter(
        (booking) =>
          booking.status === "COMPLETED",
      ).length,

      cancelled: bookings.filter(
        (booking) =>
          booking.status === "CANCELLED" ||
          booking.status === "REJECTED",
      ).length,

      paid: bookings.filter(
        (booking) =>
          booking.payment_status === "PAID",
      ).length,

      paymentPending: bookings.filter(
        (booking) =>
          booking.payment_status === "PENDING",
      ).length,

      revenue: paidRevenue,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        const bookingDate =
          booking.starts_at.slice(0, 10);

        return (
          (!filters.court ||
            getCourtName(booking) ===
              filters.court) &&
          (!filters.customer ||
            getCustomerName(booking) ===
              filters.customer) &&
          (!filters.status ||
            booking.status === filters.status) &&
          (!filters.paymentStatus ||
            booking.payment_status ===
              filters.paymentStatus) &&
          (!filters.dateFrom ||
            bookingDate >= filters.dateFrom) &&
          (!filters.dateTo ||
            bookingDate <= filters.dateTo)
        );
      });
  }, [
    bookings,
    filters,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBookings.length / PAGE_SIZE,
    ),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const pageStart =
    (safeCurrentPage - 1) * PAGE_SIZE;

  const paginatedBookings =
    filteredBookings.slice(
      pageStart,
      pageStart + PAGE_SIZE,
    );

  const activeFilters = [
    filters.court
      ? {
          key: "court" as keyof Filters,
          label: filters.court,
        }
      : null,

    filters.customer
      ? {
          key: "customer" as keyof Filters,
          label: filters.customer,
        }
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
  ].filter(Boolean) as Array<{
    key: keyof Filters;
    label: string;
  }>;

  function updateFilter<Key extends keyof Filters>(
    key: Key,
    value: Filters[Key],
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));

    setCurrentPage(1);
  }

  function clearFilter(
    key: keyof Filters,
  ) {
    updateFilter(key, "");
  }

  function clearAllFilters() {
    setFilters(initialFilters);
    setCurrentPage(1);
  }

  return (
    <main className="bookings-page">
      <section className="bookings-hero">
        <div className="hero-decoration hero-decoration-large" />
        <div className="hero-decoration hero-decoration-small" />

        <div className="hero-main">
          <div className="hero-content">
            <div>
              <span className="page-eyebrow">
                BOOKING OPERATIONS
              </span>

              <h1>Bookings</h1>

              <p>
                Manage reservations, arrivals
                and payments from one
                operational workspace.
              </p>
            </div>

          </div>

          <div className="hero-filter-chips">
            {[
              "",
              "PENDING",
              "CONFIRMED",
              "COMPLETED",
              "CANCELLED",
            ].map((status) => (
              <button
                type="button"
                className={
                  filters.status === status
                    ? "active"
                    : ""
                }
                onClick={() =>
                  updateFilter(
                    "status",
                    status,
                  )
                }
                key={status || "all"}
              >
                {status
                  ? status.charAt(0) +
                    status
                      .slice(1)
                      .toLowerCase()
                  : "All Bookings"}
              </button>
            ))}
          </div>

          <div className="hero-kpis">
            <article>
              <span>Total bookings</span>

              <strong>
                {summary.total}
              </strong>

              <small>
                Current records
              </small>
            </article>

            <article>
              <span>Confirmed</span>

              <strong>
                {summary.confirmed}
              </strong>

              <small>
                Ready for arrival
              </small>
            </article>

            <article>
              <span>Pending</span>

              <strong>
                {summary.pending}
              </strong>

              <small>
                Need confirmation
              </small>
            </article>

            <article>
              <span>Completed</span>

              <strong>
                {summary.completed}
              </strong>

              <small>
                Finished bookings
              </small>
            </article>
          </div>
        </div>

        <aside className="hero-overview">
          <div className="hero-overview-head">
            <div>
              <span>
                Paid revenue
              </span>

              <strong>
                {formatCurrency(
                  summary.revenue,
                )}
              </strong>
            </div>

            <span className="hero-trend">
              <TrendingUp size={13} />
              Live
            </span>
          </div>

          <div className="hero-overview-stat">
            <div>
              <span>
                Payment collection
              </span>

              <strong>
                {summary.total
                  ? Math.round(
                      (summary.paid /
                        summary.total) *
                        100,
                    )
                  : 0}
                %
              </strong>
            </div>

            <div className="hero-progress">
              <i
                style={{
                  width: `${
                    summary.total
                      ? Math.round(
                          (summary.paid /
                            summary.total) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="hero-overview-grid">
            <article>
              <Clock3 size={17} />

              <span>
                Pending payments
              </span>

              <strong>
                {summary.paymentPending}
              </strong>
            </article>

            <article>
              <UserCheck size={17} />

              <span>
                Completed
              </span>

              <strong>
                {summary.completed}
              </strong>
            </article>
          </div>

          <div className="hero-health">
            <CheckCircle2 size={18} />

            <div>
              <strong>
                Booking system connected
              </strong>

              <span>
                Data loaded from Supabase
              </span>
            </div>
          </div>
        </aside>
      </section>

      <section className="booking-kpis">
        {[
          {
            label: "Total Bookings",
            value: summary.total,
            note: "Current records",
            icon: CalendarDays,
          },
          {
            label: "Confirmed",
            value: summary.confirmed,
            note: "Ready for arrival",
            icon: CheckCircle2,
          },
          {
            label: "Paid Revenue",
            value: formatCurrency(
              summary.revenue,
            ),
            note: "Paid bookings",
            icon: IndianRupee,
          },
          {
            label: "Pending",
            value: summary.pending,
            note: "Need confirmation",
            icon: Clock3,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article
              className="kpi-card"
              key={item.label}
            >
              <div className="kpi-card-top">
                <span className="kpi-icon">
                  <Icon size={18} />
                </span>
              </div>

              <span>
                {item.label}
              </span>

              <strong>
                {item.value}
              </strong>

              <small>
                {item.note}
              </small>
            </article>
          );
        })}
      </section>

      <section className="booking-workspace">
        <header className="workspace-heading">
          <div>
            <span className="page-eyebrow">
              RESERVATIONS
            </span>

            <h2>
              Booking Management
            </h2>

            <p>
              Review customers, schedules,
              payments and booking status.
            </p>
          </div>

        </header>

        {error && (
          <div className="booking-error">
            <div>
              <strong>
                Could not load bookings
              </strong>

              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={loadBookings}
            >
              Try Again
            </button>
          </div>
        )}

        <div className="booking-controls">
          <PartnerSelect
            value={filters.status}
            onValueChange={(value) =>
              updateFilter(
                "status",
                value,
              )
            }
          >
            <option value="">
              All statuses
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="CONFIRMED">
              Confirmed
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

            <option value="REJECTED">
              Rejected
            </option>
          </PartnerSelect>

          <PartnerSelect
            value={filters.court}
            onValueChange={(value) =>
              updateFilter(
                "court",
                value,
              )
            }
          >
            <option value="">
              All courts
            </option>

            {courts.map((court) => (
              <option
                value={court}
                key={court}
              >
                {court}
              </option>
            ))}
          </PartnerSelect>

          <button
            type="button"
            className={`filter-button ${
              showAdvancedFilters
                ? "active"
                : ""
            }`}
            onClick={() =>
              setShowAdvancedFilters(
                (current) => !current,
              )
            }
          >
            <SlidersHorizontal
              size={16}
            />

            More Filters
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="advanced-filters">
            <label>
              <span>
                Customer
              </span>

              <PartnerSelect
                value={
                  filters.customer
                }
                onValueChange={(value) =>
                  updateFilter(
                    "customer",
                    value,
                  )
                }
              >
                <option value="">
                  All customers
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      value={customer}
                      key={customer}
                    >
                      {customer}
                    </option>
                  ),
                )}
              </PartnerSelect>
            </label>

            <label>
              <span>
                Payment status
              </span>

              <PartnerSelect
                value={
                  filters.paymentStatus
                }
                onValueChange={(value) =>
                  updateFilter(
                    "paymentStatus",
                    value,
                  )
                }
              >
                <option value="">
                  All payments
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="PAID">
                  Paid
                </option>

                <option value="FAILED">
                  Failed
                </option>

                <option value="REFUNDED">
                  Refunded
                </option>
              </PartnerSelect>
            </label>

            <label>
              <span>
                Date from
              </span>

              <input
                type="date"
                value={
                  filters.dateFrom
                }
                onChange={(event) =>
                  updateFilter(
                    "dateFrom",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>
                Date to
              </span>

              <input
                type="date"
                value={
                  filters.dateTo
                }
                min={
                  filters.dateFrom ||
                  undefined
                }
                onChange={(event) =>
                  updateFilter(
                    "dateTo",
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        )}

        {activeFilters.length > 0 && (
          <div className="active-filters">
            <span>
              Active filters
            </span>

            <div>
              {activeFilters.map(
                (filter) => (
                  <button
                    type="button"
                    onClick={() =>
                      clearFilter(
                        filter.key,
                      )
                    }
                    key={filter.key}
                  >
                    {filter.label}

                    <X size={12} />
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={
                clearAllFilters
              }
            >
              Clear all
            </button>
          </div>
        )}

        <div className="records-heading">
          <div>
            <strong>
              {filteredBookings.length}{" "}
              {filteredBookings.length ===
              1
                ? "booking"
                : "bookings"}
            </strong>

            <span>
              {activeFilters.length
                ? "Matching current filters"
                : "All reservation records"}
            </span>
          </div>

        </div>

        {isLoading ? (
          <BookingSkeleton />
        ) : paginatedBookings.length ===
          0 ? (
          <div className="empty-state">
            <span>
              <CalendarDays size={24} />
            </span>

            <h3>
              No bookings found
            </h3>

            <p>
              There are no reservations
              matching your current
              filters.
            </p>

            {activeFilters.length >
              0 && (
              <button
                type="button"
                onClick={
                  clearAllFilters
                }
              >
                Clear Filters
              </button>
            )}

            {bookings.length === 0 &&
              !error && (
                <Link
                  href="/partner/bookings/add"
                >
                  <Plus size={16} />
                  Create First Booking
                </Link>
              )}
          </div>
        ) : (
          <>
            <div className="booking-grid">
              {paginatedBookings.map(
                (booking) => {
                  const customer =
                    getCustomerName(
                      booking,
                    );

                  const court =
                    getCourtName(
                      booking,
                    );

                  return (
                    <article
                      className="booking-card"
                      key={booking.id}
                    >
                      <header className="booking-card-header">
                        <div className="customer-profile">
                          <span className="customer-avatar">
                            {initials(
                              customer,
                            )}
                          </span>

                          <div>
                            <span className="booking-id">
                              {
                                booking.reference
                              }
                            </span>

                            <h3>
                              {customer}
                            </h3>

                            <span className="court-name">
                              <MapPin
                                size={
                                  12
                                }
                              />

                              {court}
                            </span>
                          </div>
                        </div>
                      </header>

                      <div className="booking-date-panel">
                        <span className="calendar-icon">
                          <CalendarDays
                            size={20}
                          />
                        </span>

                        <div>
                          <span>
                            {formatDate(
                              booking.starts_at,
                            )}
                          </span>

                          <strong>
                            {formatTimeRange(
                              booking.starts_at,
                              booking.ends_at,
                            )}
                          </strong>
                        </div>

                        <span className="duration">
                          <Clock3
                            size={13}
                          />

                          {getDuration(
                            booking.starts_at,
                            booking.ends_at,
                          )}
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
                            booking.payment_status,
                          )}`}
                        >
                          <CreditCard
                            size={12}
                          />

                          {
                            booking.payment_status
                          }
                        </span>
                      </div>

                      <div className="booking-metrics">
                        <div>
                          <span>
                            Amount
                          </span>

                          <strong>
                            {formatCurrency(
                              Number(
                                booking.total_amount ||
                                  0,
                              ),
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Payment
                          </span>

                          <strong>
                            {
                              booking.payment_status
                            }
                          </strong>
                        </div>
                      </div>

                      <footer className="booking-card-footer">
                        <div className="readiness">
                          <CheckCircle2
                            size={15}
                          />

                          <span>
                            {booking.status ===
                            "CONFIRMED"
                              ? "Ready for check-in"
                              : booking.status ===
                                  "PENDING"
                                ? "Needs confirmation"
                                : booking.status ===
                                    "COMPLETED"
                                  ? "Booking completed"
                                  : booking.status ===
                                      "CANCELLED"
                                    ? "Booking cancelled"
                                    : "No action required"}
                          </span>
                        </div>

                        <Link
                          href={`/partner/bookings/${booking.id}`}
                        >
                          View Details

                          <ChevronRight
                            size={15}
                          />
                        </Link>
                      </footer>
                    </article>
                  );
                },
              )}
            </div>

            <footer className="pagination">
              <p>
                Showing{" "}
                {pageStart + 1}–
                {Math.min(
                  pageStart +
                    PAGE_SIZE,
                  filteredBookings.length,
                )}{" "}
                of{" "}
                {
                  filteredBookings.length
                }
              </p>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (current) =>
                        Math.max(
                          1,
                          current - 1,
                        ),
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    1
                  }
                >
                  <ChevronLeft
                    size={16}
                  />
                </button>

                {Array.from({
                  length: totalPages,
                }).map(
                  (_, index) => {
                    const page =
                      index + 1;

                    return (
                      <button
                        type="button"
                        className={
                          page ===
                          safeCurrentPage
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setCurrentPage(
                            page,
                          )
                        }
                        key={page}
                      >
                        {page}
                      </button>
                    );
                  },
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (current) =>
                        Math.min(
                          totalPages,
                          current + 1,
                        ),
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                >
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

      <section className="activity-summary-grid">
        <article className="payment-card">
          <header className="section-heading">
            <div>
              <span className="page-eyebrow">
                PAYMENTS
              </span>

              <h2>
                Payment Summary
              </h2>
            </div>

            <span className="section-icon">
              <CreditCard size={18} />
            </span>
          </header>

          <div className="payment-total">
            <div>
              <span>
                Collected
              </span>

              <strong>
                {formatCurrency(
                  summary.revenue,
                )}
              </strong>
            </div>
          </div>

          <div className="payment-breakdown">
            <article>
              <span className="payment-dot paid" />

              <div>
                <span>
                  Paid
                </span>

                <strong>
                  {summary.paid}
                </strong>
              </div>
            </article>

            <article>
              <span className="payment-dot pending" />

              <div>
                <span>
                  Pending
                </span>

                <strong>
                  {summary.paymentPending}
                </strong>
              </div>
            </article>

            <article>
              <span className="payment-dot refunded" />

              <div>
                <span>
                  Refunded
                </span>

                <strong>
                  {
                    bookings.filter(
                      (booking) =>
                        booking.payment_status ===
                        "REFUNDED",
                    ).length
                  }
                </strong>
              </div>
            </article>

            <article>
              <span className="payment-dot failed" />

              <div>
                <span>
                  Failed
                </span>

                <strong>
                  {
                    bookings.filter(
                      (booking) =>
                        booking.payment_status ===
                        "FAILED",
                    ).length
                  }
                </strong>
              </div>
            </article>
          </div>
        </article>

        <article className="customer-insights-card">
          <header className="section-heading">
            <div>
              <span className="page-eyebrow">
                CUSTOMERS
              </span>

              <h2>
                Booking Audience
              </h2>
            </div>

            <span className="section-icon">
              <UsersRound size={18} />
            </span>
          </header>

          <div className="audience-ring">
            <div>
              <strong>
                {customers.length}
              </strong>

              <span>
                Customers
              </span>
            </div>
          </div>

          <dl className="audience-metrics">
            <div>
              <dt>
                Total customers
              </dt>

              <dd>
                {customers.length}
              </dd>
            </div>

            <div>
              <dt>
                Total bookings
              </dt>

              <dd>
                {bookings.length}
              </dd>
            </div>

            <div>
              <dt>
                Completed
              </dt>

              <dd>
                {summary.completed}
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}
