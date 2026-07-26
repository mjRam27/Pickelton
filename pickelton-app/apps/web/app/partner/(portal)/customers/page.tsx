"use client";

import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./page.css";

type CustomerStatus = "Active" | "Inactive";
type StatusFilter = "All" | CustomerStatus;
type ActivityFilter = "All" | "Frequent" | "Occasional";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  bookings: number;
  status: CustomerStatus;
  membership: null;
  lastVisit: null;
  favoriteCourt: null;
  recentActivity: null;
}

const customers: Customer[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    phone: "+91 9876543210",
    email: "rahul@email.com",
    bookings: 24,
    status: "Active",
    membership: null,
    lastVisit: null,
    favoriteCourt: null,
    recentActivity: null,
  },
  {
    id: 2,
    name: "Priya Kumar",
    phone: "+91 9988776655",
    email: "priya@email.com",
    bookings: 12,
    status: "Active",
    membership: null,
    lastVisit: null,
    favoriteCourt: null,
    recentActivity: null,
  },
  {
    id: 3,
    name: "Amit Singh",
    phone: "+91 9123456789",
    email: "amit@email.com",
    bookings: 6,
    status: "Inactive",
    membership: null,
    lastVisit: null,
    favoriteCourt: null,
    recentActivity: null,
  },
];

const PAGE_SIZE = 2;

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function getActivityLevel(
  bookings: number,
): Exclude<ActivityFilter, "All"> {
  return bookings >= 10 ? "Frequent" : "Occasional";
}

function CustomerAvatar({
  customer,
  size = "default",
}: {
  customer: Customer;
  size?: "default" | "large";
}) {
  return (
    <span
      className={`customer-avatar customer-avatar-${size}`}
      aria-hidden="true"
    >
      {getInitials(customer.name)}
    </span>
  );
}

function StatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <span className={`status-chip status-${status.toLowerCase()}`}>
      <span aria-hidden="true" />
      {status}
    </span>
  );
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");
  const [activityFilter, setActivityFilter] =
    useState<ActivityFilter>("All");
  const [membershipFilter, setMembershipFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    customers[0]?.id ?? 0,
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const isLoading = false;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active",
  ).length;

  const repeatCustomers = customers.filter(
    (customer) => customer.bookings > 1,
  ).length;

  const returningRate = customers.length
    ? Math.round((repeatCustomers / customers.length) * 100)
    : 0;

  const mostActiveCustomer = customers.reduce<Customer | null>(
    (mostActive, customer) =>
      !mostActive || customer.bookings > mostActive.bookings
        ? customer
        : mostActive,
    null,
  );

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !normalizedQuery ||
        customer.name.toLowerCase().includes(normalizedQuery) ||
        customer.email.toLowerCase().includes(normalizedQuery) ||
        customer.phone.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "All" || customer.status === statusFilter;

      const matchesActivity =
        activityFilter === "All" ||
        getActivityLevel(customer.bookings) === activityFilter;

      const matchesMembership =
        membershipFilter === "All" ||
        (membershipFilter === "Unavailable" &&
          customer.membership === null);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesActivity &&
        matchesMembership
      );
    });
  }, [activityFilter, membershipFilter, searchQuery, statusFilter]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredCustomers.length / PAGE_SIZE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activityFilter, membershipFilter]);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const visibleCustomers = filteredCustomers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ??
    customers[0];

  const activeFilters = [
    searchQuery
      ? {
          key: "search",
          label: `Search: ${searchQuery}`,
          clear: () => setSearchQuery(""),
        }
      : null,
    statusFilter !== "All"
      ? {
          key: "status",
          label: `Status: ${statusFilter}`,
          clear: () => setStatusFilter("All"),
        }
      : null,
    activityFilter !== "All"
      ? {
          key: "activity",
          label: `Activity: ${activityFilter}`,
          clear: () => setActivityFilter("All"),
        }
      : null,
    membershipFilter !== "All"
      ? {
          key: "membership",
          label: "Membership: Unavailable",
          clear: () => setMembershipFilter("All"),
        }
      : null,
  ].filter(
    (
      filter,
    ): filter is {
      key: string;
      label: string;
      clear: () => void;
    } => Boolean(filter),
  );

  const heroMetrics = [
    {
      label: "Total Customers",
      value: customers.length,
      note: "Customer records",
      icon: Users,
    },
    {
      label: "Active Customers",
      value: activeCustomers,
      note: "Currently active",
      icon: UserCheck,
    },
    {
      label: "New This Month",
      value: "—",
      note: "Data unavailable",
      icon: UserPlus,
    },
    {
      label: "Returning",
      value: repeatCustomers,
      note: `${returningRate}% return rate`,
      icon: Activity,
    },
  ];

  const summaryCards = [
    {
      label: "Total Customers",
      value: customers.length,
      note: "Customer records available",
      icon: Users,
      tone: "",
    },
    {
      label: "Active Members",
      value: activeCustomers,
      note: "Currently marked active",
      icon: UserCheck,
      tone: "active",
    },
    {
      label: "New Customers",
      value: "—",
      note: "Acquisition dates unavailable",
      icon: UserPlus,
      tone: "new",
    },
    {
      label: "Repeat Customers",
      value: repeatCustomers,
      note: "Multiple bookings",
      icon: Activity,
      tone: "returning",
    },
  ];

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("All");
    setActivityFilter("All");
    setMembershipFilter("All");
  }

  function selectCustomer(id: number) {
    setSelectedCustomerId(id);
    setOpenMenuId(null);
  }

  return (
    <main className="customers-page">
      <section className="customers-hero">
        <div className="hero-primary">
          <header className="hero-header">
            <div>
              <span className="hero-eyebrow">
                CUSTOMER MANAGEMENT
              </span>
              <h1>Customers</h1>
              <p>
                Manage customer relationships, activity and booking
                history.
              </p>
            </div>

            <button className="primary-btn" type="button">
              <UserPlus size={18} aria-hidden="true" />
              Add Customer
            </button>
          </header>

          <label className="hero-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search customers</span>
            <input
              type="search"
              value={searchQuery}
              placeholder="Search by name, email or phone..."
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </label>

          <div className="hero-filter-chips">
            <button
              type="button"
              className={
                statusFilter === "All" &&
                activityFilter === "All" &&
                membershipFilter === "All"
                  ? "active"
                  : ""
              }
              onClick={clearFilters}
            >
              All Customers
            </button>

            <button
              type="button"
              className={statusFilter === "Active" ? "active" : ""}
              onClick={() =>
                setStatusFilter(
                  statusFilter === "Active" ? "All" : "Active",
                )
              }
            >
              Active
            </button>

            <button
              type="button"
              className={statusFilter === "Inactive" ? "active" : ""}
              onClick={() =>
                setStatusFilter(
                  statusFilter === "Inactive" ? "All" : "Inactive",
                )
              }
            >
              Inactive
            </button>

            <button
              type="button"
              className={
                activityFilter === "Frequent" ? "active" : ""
              }
              onClick={() =>
                setActivityFilter(
                  activityFilter === "Frequent"
                    ? "All"
                    : "Frequent",
                )
              }
            >
              Frequent
            </button>

            <button
              type="button"
              className={
                activityFilter === "Occasional" ? "active" : ""
              }
              onClick={() =>
                setActivityFilter(
                  activityFilter === "Occasional"
                    ? "All"
                    : "Occasional",
                )
              }
            >
              Occasional
            </button>
          </div>
        </div>

        <div className="hero-kpis">
          {heroMetrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article className="hero-kpi" key={metric.label}>
                <span className="hero-kpi-icon">
                  <Icon size={19} aria-hidden="true" />
                </span>

                <div>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.note}</small>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="summary-grid" aria-label="Customer summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article className="summary-card" key={card.label}>
              <span className={`summary-icon ${card.tone}`}>
                <Icon size={19} aria-hidden="true" />
              </span>

              <div>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.note}</small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="customer-insights">
        <header className="section-heading">
          <div>
            <span className="section-eyebrow">CRM INSIGHTS</span>
            <h2>Customer Intelligence</h2>
          </div>
          <p>Relationship and engagement signals at a glance.</p>
        </header>

        <div className="insights-grid">
          <article className="insight-item">
            <span className="insight-icon">
              <Activity size={18} aria-hidden="true" />
            </span>
            <div>
              <span>Most Active Customer</span>
              <strong>{mostActiveCustomer?.name ?? "Unavailable"}</strong>
              <small>
                {mostActiveCustomer
                  ? `${mostActiveCustomer.bookings} lifetime bookings`
                  : "No customer data"}
              </small>
            </div>
          </article>

          <article className="insight-item">
            <span className="insight-icon">
              <Users size={18} aria-hidden="true" />
            </span>
            <div>
              <span>Returning Customer Rate</span>
              <strong>{returningRate}%</strong>
              <small>{repeatCustomers} repeat customers</small>
            </div>
          </article>

          <article className="insight-item">
            <span className="insight-icon">
              <UserPlus size={18} aria-hidden="true" />
            </span>
            <div>
              <span>New This Week</span>
              <strong>—</strong>
              <small>Acquisition dates unavailable</small>
            </div>
          </article>

          <article className="insight-item">
            <span className="insight-icon">
              <CalendarDays size={18} aria-hidden="true" />
            </span>
            <div>
              <span>Total Bookings</span>
              <strong>
                {customers.reduce(
                  (total, customer) => total + customer.bookings,
                  0,
                )}
              </strong>
              <small>Across all customer records</small>
            </div>
          </article>
        </div>
      </section>

      <section className="customer-directory">
        <div className="customer-list-card">
          <header className="list-card-header">
            <div>
              <span className="section-eyebrow">CRM DIRECTORY</span>
              <h2>Customer Profiles</h2>
              <p>
                Browse customers and open a profile for more context.
              </p>
            </div>

            <button className="secondary-btn" type="button">
              <Filter size={16} aria-hidden="true" />
              Filters
            </button>
          </header>

          <div className="filter-toolbar">
            <label className="search-field">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search customers</span>
              <input
                type="search"
                value={searchQuery}
                placeholder="Search customers..."
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <div className="filter-controls">
              <span className="filter-label">
                <Filter size={15} aria-hidden="true" />
                Refine
              </span>

              <label>
                <span className="sr-only">Membership</span>
                <select
                  value={membershipFilter}
                  onChange={(event) =>
                    setMembershipFilter(event.target.value)
                  }
                >
                  <option value="All">All memberships</option>
                  <option value="Unavailable">
                    Membership unavailable
                  </option>
                </select>
              </label>

              <label>
                <span className="sr-only">Customer status</span>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              <label>
                <span className="sr-only">Booking activity</span>
                <select
                  value={activityFilter}
                  onChange={(event) =>
                    setActivityFilter(
                      event.target.value as ActivityFilter,
                    )
                  }
                >
                  <option value="All">All activity</option>
                  <option value="Frequent">Frequent</option>
                  <option value="Occasional">Occasional</option>
                </select>
              </label>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="active-filter-row">
              <div className="filter-chips">
                {activeFilters.map((filter) => (
                  <button
                    type="button"
                    className="filter-chip"
                    key={filter.key}
                    onClick={filter.clear}
                  >
                    {filter.label}
                    <X size={13} aria-hidden="true" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Clear all
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="customer-loading" aria-live="polite">
              <div className="loading-card" />
              <div className="loading-card" />
            </div>
          ) : visibleCustomers.length === 0 ? (
            <div className="customer-empty">
              <span>
                <Users size={25} aria-hidden="true" />
              </span>
              <h3>No customers found</h3>
              <p>Adjust your search or filters to see more profiles.</p>
              <button
                type="button"
                className="secondary-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="customer-card-grid">
              {visibleCustomers.map((customer) => {
                const activityLevel = getActivityLevel(
                  customer.bookings,
                );
                const isSelected =
                  selectedCustomerId === customer.id;

                return (
                  <article
                    className={`customer-profile-card ${
                      isSelected ? "selected" : ""
                    }`}
                    key={customer.id}
                    onClick={() => selectCustomer(customer.id)}
                  >
                    <header className="profile-card-header">
                      <div className="profile-card-identity">
                        <CustomerAvatar
                          customer={customer}
                          size="large"
                        />

                        <div>
                          <div className="customer-name-row">
                            <h3>{customer.name}</h3>
                            <StatusBadge status={customer.status} />
                          </div>

                          <span
                            className={`activity-chip activity-${activityLevel.toLowerCase()}`}
                          >
                            {activityLevel} customer
                          </span>
                        </div>
                      </div>

                      <div
                        className="profile-menu"
                        ref={
                          openMenuId === customer.id
                            ? actionMenuRef
                            : undefined
                        }
                      >
                        <button
                          type="button"
                          className="action-menu-trigger"
                          aria-label={`Open actions for ${customer.name}`}
                          aria-expanded={openMenuId === customer.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuId(
                              openMenuId === customer.id
                                ? null
                                : customer.id,
                            );
                          }}
                        >
                          <MoreHorizontal
                            size={18}
                            aria-hidden="true"
                          />
                        </button>

                        {openMenuId === customer.id && (
                          <div className="action-menu">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                selectCustomer(customer.id);
                              }}
                            >
                              <CircleUserRound
                                size={15}
                                aria-hidden="true"
                              />
                              View Profile
                            </button>

                            <a
                              href={`mailto:${customer.email}`}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Mail size={15} aria-hidden="true" />
                              Send Email
                            </a>

                            <a
                              href={`tel:${customer.phone.replace(/\s/g, "")}`}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Phone size={15} aria-hidden="true" />
                              Call Customer
                            </a>
                          </div>
                        )}
                      </div>
                    </header>

                    <div className="profile-contact-grid">
                      <a
                        href={`mailto:${customer.email}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span className="contact-icon">
                          <Mail size={15} aria-hidden="true" />
                        </span>
                        <span>
                          <small>Email</small>
                          <strong>{customer.email}</strong>
                        </span>
                      </a>

                      <a
                        href={`tel:${customer.phone.replace(/\s/g, "")}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span className="contact-icon">
                          <Phone size={15} aria-hidden="true" />
                        </span>
                        <span>
                          <small>Phone</small>
                          <strong>{customer.phone}</strong>
                        </span>
                      </a>
                    </div>

                    <dl className="profile-detail-grid">
                      <div>
                        <dt>Membership</dt>
                        <dd>
                          {customer.membership ?? "Not available"}
                        </dd>
                      </div>
                      <div>
                        <dt>Favourite Court</dt>
                        <dd>
                          {customer.favoriteCourt ?? "Not available"}
                        </dd>
                      </div>
                    </dl>

                    <div className="profile-performance">
                      <article>
                        <span>Lifetime Bookings</span>
                        <strong>{customer.bookings}</strong>
                      </article>

                      <article>
                        <span>Last Visit</span>
                        <strong>
                          {customer.lastVisit ?? "Unavailable"}
                        </strong>
                      </article>

                      <article>
                        <span>Customer Value</span>
                        <strong>Unavailable</strong>
                      </article>
                    </div>

                    <footer className="profile-card-actions">
                      <button
                        type="button"
                        className="view-profile-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          selectCustomer(customer.id);
                        }}
                      >
                        <CircleUserRound
                          size={15}
                          aria-hidden="true"
                        />
                        View Profile
                      </button>

                      <a
                        href={`mailto:${customer.email}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Mail size={15} aria-hidden="true" />
                        Contact
                      </a>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}

          <footer className="pagination">
            <p>
              Showing{" "}
              {filteredCustomers.length
                ? (currentPage - 1) * PAGE_SIZE + 1
                : 0}{" "}
              to{" "}
              {Math.min(
                currentPage * PAGE_SIZE,
                filteredCustomers.length,
              )}{" "}
              of {filteredCustomers.length} customers
            </p>

            <div className="pagination-controls">
              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>

              {Array.from({ length: pageCount }, (_, index) => {
                const page = index + 1;

                return (
                  <button
                    type="button"
                    className={currentPage === page ? "active" : ""}
                    key={page}
                    aria-label={`Page ${page}`}
                    aria-current={
                      currentPage === page ? "page" : undefined
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                type="button"
                aria-label="Next page"
                disabled={currentPage === pageCount}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(pageCount, page + 1),
                  )
                }
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </footer>
        </div>

        {selectedCustomer && (
          <aside className="customer-preview">
            <header className="preview-header">
              <CustomerAvatar
                customer={selectedCustomer}
                size="large"
              />

              <div className="preview-identity">
                <span className="section-eyebrow">
                  CUSTOMER PROFILE
                </span>
                <h2>{selectedCustomer.name}</h2>
                <StatusBadge status={selectedCustomer.status} />
              </div>
            </header>

            <div className="preview-contact-actions">
              <a href={`mailto:${selectedCustomer.email}`}>
                <Mail size={16} aria-hidden="true" />
                Email
              </a>
              <a
                href={`tel:${selectedCustomer.phone.replace(/\s/g, "")}`}
              >
                <Phone size={16} aria-hidden="true" />
                Call
              </a>
            </div>

            <section className="preview-section">
              <h3>Contact Information</h3>

              <a href={`mailto:${selectedCustomer.email}`}>
                <Mail size={15} aria-hidden="true" />
                <span>
                  <small>Email</small>
                  <strong>{selectedCustomer.email}</strong>
                </span>
              </a>

              <a
                href={`tel:${selectedCustomer.phone.replace(/\s/g, "")}`}
              >
                <Phone size={15} aria-hidden="true" />
                <span>
                  <small>Phone</small>
                  <strong>{selectedCustomer.phone}</strong>
                </span>
              </a>
            </section>

            <section className="preview-section">
              <h3>Booking Summary</h3>

              <div className="preview-stat-grid">
                <div>
                  <span>Total Bookings</span>
                  <strong>{selectedCustomer.bookings}</strong>
                </div>
                <div>
                  <span>Activity</span>
                  <strong>
                    {getActivityLevel(selectedCustomer.bookings)}
                  </strong>
                </div>
              </div>
            </section>

            <section className="preview-section">
              <h3>Relationship</h3>

              <dl className="preview-details">
                <div>
                  <dt>Membership</dt>
                  <dd>
                    {selectedCustomer.membership ?? "Not available"}
                  </dd>
                </div>
                <div>
                  <dt>Favourite Court</dt>
                  <dd>
                    {selectedCustomer.favoriteCourt ?? "Not available"}
                  </dd>
                </div>
                <div>
                  <dt>Last Visit</dt>
                  <dd>
                    {selectedCustomer.lastVisit ?? "Not available"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="preview-section recent-activity">
              <h3>Recent Activity</h3>

              <div className="preview-empty">
                <CalendarDays size={19} aria-hidden="true" />
                <div>
                  <strong>No activity available</strong>
                  <p>
                    Recent customer activity is not included in the
                    current data.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        )}
      </section>
    </main>
  );
}