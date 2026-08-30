"use client";

import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Edit3,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PartnerSelect from "@/components/partner/PartnerSelect";
import { formatPartnerDate as formatDate } from "@/lib/partner-date";

import "./page.css";

type CustomerStatus = "Active" | "Inactive";

type StatusFilter = "All" | CustomerStatus;

type ActivityFilter =
  | "All"
  | "Frequent"
  | "Occasional"
  | "New";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookings: number;
  status: CustomerStatus;
  membership: string | null;
  lastVisit: string | null;
  favoriteCourt: string | null;
  totalSpent: number;
}

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
}

const API_BASE = "http://localhost:8090/api/v1";

const PAGE_SIZE = 2;

/* =========================================================
   AUTH
========================================================= */

function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("partner_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("partner_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("access_token")
  );
}

/* =========================================================
   API
========================================================= */

async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
) {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Partner login session not found. Please login again.",
    );
  }

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Your partner login session has expired. Please login again.",
      );
    }

    throw new Error(
      data?.error?.message ||
        data?.message ||
        `Request failed with status ${response.status}`,
    );
  }

  return data;
}

/* =========================================================
   MAP BACKEND CUSTOMER
========================================================= */

function mapCustomer(item: any): Customer {
  return {
    id: String(item.id),

    name: item.name ?? "",

    email: item.email ?? "",

    phone: item.phone ?? "",

    bookings: Number(
      item.booking_count ??
        item.bookings ??
        item.bookingCount ??
        0,
    ),

    status:
      String(item.status).toUpperCase() === "INACTIVE"
        ? "Inactive"
        : "Active",

    membership: item.membership ?? null,

    lastVisit:
      item.last_booking_at ??
      item.lastBookingAt ??
      null,

    favoriteCourt:
      item.favorite_court ??
      item.favoriteCourt ??
      null,

    totalSpent: Number(
      item.total_spent ??
        item.totalSpent ??
        0,
    ),
  };
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CU"
  );
}

/*
  0 bookings = New customer
  1-9 bookings = Occasional
  10+ bookings = Frequent
*/

function getActivityLevel(
  bookings: number,
): ActivityFilter {
  if (bookings === 0) {
    return "New";
  }

  if (bookings >= 10) {
    return "Frequent";
  }

  return "Occasional";
}

function cleanPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

/* =========================================================
   AVATAR
========================================================= */

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

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}: {
  status: CustomerStatus;
}) {
  return (
    <span
      className={`status-chip status-${status.toLowerCase()}`}
    >
      <span aria-hidden="true" />
      {status}
    </span>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");

  const [activityFilter, setActivityFilter] =
    useState<ActivityFilter>("All");

  const [membershipFilter, setMembershipFilter] =
    useState("All");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedCustomerId, setSelectedCustomerId] =
    useState<string | null>(null);

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showCustomerModal, setShowCustomerModal] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [customerForm, setCustomerForm] =
    useState<CustomerForm>({
      name: "",
      email: "",
      phone: "",
    });

  const actionMenuRef =
    useRef<HTMLDivElement | null>(null);

  const profileRef =
    useRef<HTMLElement | null>(null);

  /* =======================================================
     LOAD CUSTOMERS
  ======================================================= */

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest(
        "/customers?page=0&size=100",
      );

      const raw =
        result?.data?.content ??
        result?.data ??
        [];

      const mapped = Array.isArray(raw)
        ? raw.map(mapCustomer)
        : [];

      setCustomers(mapped);

      setSelectedCustomerId((current) => {
        if (
          current &&
          mapped.some(
            (customer) =>
              customer.id === current,
          )
        ) {
          return current;
        }

        return mapped[0]?.id ?? null;
      });
    } catch (err: any) {
      console.error(
        "Failed to load customers:",
        err,
      );

      setError(
        err?.message ||
          "Unable to load customers.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  /* =======================================================
     CLOSE ACTION MENU
  ======================================================= */

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const activeCustomers =
    customers.filter(
      (customer) =>
        customer.status === "Active",
    ).length;

  const repeatCustomers =
    customers.filter(
      (customer) =>
        customer.bookings > 1,
    ).length;

  const returningRate =
    customers.length > 0
      ? Math.round(
          (repeatCustomers /
            customers.length) *
            100,
        )
      : 0;

  const mostActiveCustomer =
    customers.reduce<Customer | null>(
      (best, customer) => {
        if (
          !best ||
          customer.bookings >
            best.bookings
        ) {
          return customer;
        }

        return best;
      },
      null,
    );

  const totalBookings =
    customers.reduce(
      (total, customer) =>
        total + customer.bookings,
      0,
    );

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredCustomers =
    useMemo(() => {
      return customers.filter(
        (customer) => {
          const matchesStatus =
            statusFilter === "All" ||
            customer.status ===
              statusFilter;

          const matchesActivity =
            activityFilter === "All" ||
            getActivityLevel(
              customer.bookings,
            ) === activityFilter;

          const matchesMembership =
            membershipFilter === "All" ||
            (membershipFilter ===
              "Unavailable" &&
              customer.membership === null);

          return (
            matchesStatus &&
            matchesActivity &&
            matchesMembership
          );
        },
      );
    }, [
      customers,
      statusFilter,
      activityFilter,
      membershipFilter,
    ]);

  const pageCount = Math.max(
    1,
    Math.ceil(
      filteredCustomers.length /
        PAGE_SIZE,
    ),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    statusFilter,
    activityFilter,
    membershipFilter,
  ]);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [
    currentPage,
    pageCount,
  ]);

  const visibleCustomers =
    filteredCustomers.slice(
      (currentPage - 1) *
        PAGE_SIZE,
      currentPage * PAGE_SIZE,
    );

  const selectedCustomer =
    customers.find(
      (customer) =>
        customer.id ===
        selectedCustomerId,
    ) ?? null;

  /* =======================================================
     FILTER HELPERS
  ======================================================= */

  function clearFilters() {
    setStatusFilter("All");
    setActivityFilter("All");
    setMembershipFilter("All");
  }

  /* =======================================================
     VIEW PROFILE
  ======================================================= */

  function viewCustomerProfile(
    customer: Customer,
  ) {
    setSelectedCustomerId(customer.id);
    setOpenMenuId(null);

    /*
      Small timeout lets React render the selected
      profile before scrolling to it.
    */
    setTimeout(() => {
      profileRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 50);
  }

  /* =======================================================
     EMAIL
  ======================================================= */

  function emailCustomer(
    customer: Customer,
  ) {
    setOpenMenuId(null);

    if (!customer.email) {
      setError(
        "This customer does not have an email address.",
      );
      return;
    }

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(customer.email)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  /* =======================================================
     CALL
  ======================================================= */

  function callCustomer(
    customer: Customer,
  ) {
    setOpenMenuId(null);

    if (!customer.phone) {
      setError(
        "This customer does not have a phone number.",
      );
      return;
    }

    window.location.href =
      `tel:${cleanPhone(customer.phone)}`;
  }

  /* =======================================================
     ADD
  ======================================================= */

  function openAddCustomer() {
    setEditingCustomer(null);

    setCustomerForm({
      name: "",
      email: "",
      phone: "",
    });

    setError("");
    setOpenMenuId(null);
    setShowCustomerModal(true);
  }

  /* =======================================================
     EDIT
  ======================================================= */

  function openEditCustomer(
    customer: Customer,
  ) {
    setEditingCustomer(customer);

    setCustomerForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });

    setError("");
    setOpenMenuId(null);
    setShowCustomerModal(true);
  }

  /* =======================================================
     SAVE CUSTOMER
  ======================================================= */

  async function saveCustomer() {
    const name =
      customerForm.name.trim();

    const email =
      customerForm.email.trim();

    const phone =
      customerForm.phone.trim();

    if (!name) {
      setError("Name is required.");
      return;
    }

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!phone) {
      setError(
        "Phone number is required.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingCustomer) {
        const result =
          await apiRequest(
            `/customers/${editingCustomer.id}`,
            {
              method: "PATCH",
              body: JSON.stringify({
                name,
                email,
                phone,
              }),
            },
          );

        if (result?.data) {
          const updated =
            mapCustomer(result.data);

          setCustomers((current) =>
            current.map((customer) =>
              customer.id ===
              editingCustomer.id
                ? updated
                : customer,
            ),
          );

          setSelectedCustomerId(
            updated.id,
          );
        }
      } else {
        const result =
          await apiRequest(
            "/customers",
            {
              method: "POST",
              body: JSON.stringify({
                name,
                email,
                phone,
              }),
            },
          );

        if (result?.data) {
          const newCustomer =
            mapCustomer(result.data);

          setCustomers((current) => [
            newCustomer,
            ...current,
          ]);

          setSelectedCustomerId(
            newCustomer.id,
          );
        }
      }

      setShowCustomerModal(false);
      setEditingCustomer(null);

      setCustomerForm({
        name: "",
        email: "",
        phone: "",
      });

      await loadCustomers();
    } catch (err: any) {
      console.error(
        "Customer save failed:",
        err,
      );

      setError(
        err?.message ||
          "Unable to save customer.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function deleteCustomer(
    customer: Customer,
  ) {
    setOpenMenuId(null);

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${customer.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiRequest(
        `/customers/${customer.id}`,
        {
          method: "DELETE",
        },
      );

      const remaining =
        customers.filter(
          (item) =>
            item.id !== customer.id,
        );

      setCustomers(remaining);

      if (
        selectedCustomerId ===
        customer.id
      ) {
        setSelectedCustomerId(
          remaining[0]?.id ?? null,
        );
      }

      await loadCustomers();
    } catch (err: any) {
      console.error(
        "Customer delete failed:",
        err,
      );

      setError(
        err?.message ||
          "Unable to delete customer.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     ACTIVE FILTERS
  ======================================================= */

  const activeFilters = [
    statusFilter !== "All"
      ? {
          key: "status",
          label: `Status: ${statusFilter}`,
          clear: () =>
            setStatusFilter("All"),
        }
      : null,

    activityFilter !== "All"
      ? {
          key: "activity",
          label: `Activity: ${activityFilter}`,
          clear: () =>
            setActivityFilter("All"),
        }
      : null,

    membershipFilter !== "All"
      ? {
          key: "membership",
          label:
            "Membership: Unavailable",
          clear: () =>
            setMembershipFilter("All"),
        }
      : null,
  ].filter(Boolean) as {
    key: string;
    label: string;
    clear: () => void;
  }[];

  /* =======================================================
     RENDER
  ======================================================= */

  if (showCustomerModal && !editingCustomer) {
    return (
      <main className="add-customer-page">
        <button
          type="button"
          className="add-customer-back"
          disabled={saving}
          onClick={() => setShowCustomerModal(false)}
        >
          ← Back to Customers
        </button>

        <section className="add-customer-hero">
          <span className="add-customer-hero-orbit add-customer-hero-orbit-large" />
          <span className="add-customer-hero-orbit add-customer-hero-orbit-small" />

          <div className="add-customer-hero-copy">
            <span className="add-customer-eyebrow">ADD CUSTOMER</span>
            <h1>Add New Customer</h1>
            <p>Create a new customer profile.</p>
          </div>
        </section>

        <section className="add-customer-form-card">
          {error && <div className="add-customer-error">{error}</div>}

          <div className="add-customer-form">
            <label>
              <span>Customer Name *</span>
              <input
                type="text"
                value={customerForm.name}
                placeholder="Enter customer name"
                disabled={saving}
                onChange={(event) =>
                  setCustomerForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span>Email *</span>
              <input
                type="email"
                value={customerForm.email}
                placeholder="customer@example.com"
                disabled={saving}
                onChange={(event) =>
                  setCustomerForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span>Phone Number *</span>
              <input
                type="tel"
                value={customerForm.phone}
                placeholder="9876501234"
                disabled={saving}
                onChange={(event) =>
                  setCustomerForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="add-customer-actions">
            <button
              type="button"
              className="add-customer-cancel"
              disabled={saving}
              onClick={() => setShowCustomerModal(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="add-customer-submit"
              disabled={saving}
              onClick={saveCustomer}
            >
              {saving ? "Saving..." : "Add Customer"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className="customers-page">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="customers-hero">

          <div className="hero-primary">

            <header className="hero-header">

              <div>
                <span className="hero-eyebrow">
                  CUSTOMER MANAGEMENT
                </span>

                <h1>Customers</h1>

                <p>
                  Manage customer
                  relationships, activity
                  and booking history.
                </p>
              </div>

              <button
                className="primary-btn add-customer"
                type="button"
                onClick={
                  openAddCustomer
                }
              >
                <UserPlus size={18} />
                Add Customer
              </button>

            </header>

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
                className={
                  statusFilter === "Active"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setStatusFilter(
                    statusFilter ===
                      "Active"
                      ? "All"
                      : "Active",
                  )
                }
              >
                Active
              </button>

              <button
                type="button"
                className={
                  statusFilter === "Inactive"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setStatusFilter(
                    statusFilter ===
                      "Inactive"
                      ? "All"
                      : "Inactive",
                  )
                }
              >
                Inactive
              </button>

              <button
                type="button"
                className={
                  activityFilter ===
                  "Frequent"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActivityFilter(
                    activityFilter ===
                      "Frequent"
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
                  activityFilter ===
                  "Occasional"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActivityFilter(
                    activityFilter ===
                      "Occasional"
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

            <article className="hero-kpi">
              <span className="hero-kpi-icon">
                <Users size={19} />
              </span>

              <div>
                <span>
                  Total Customers
                </span>

                <strong>
                  {customers.length}
                </strong>

                <small>
                  Customer records
                </small>
              </div>
            </article>

            <article className="hero-kpi">
              <span className="hero-kpi-icon">
                <UserCheck size={19} />
              </span>

              <div>
                <span>
                  Active Customers
                </span>

                <strong>
                  {activeCustomers}
                </strong>

                <small>
                  Currently active
                </small>
              </div>
            </article>

            <article className="hero-kpi">
              <span className="hero-kpi-icon">
                <UserPlus size={19} />
              </span>

              <div>
                <span>
                  New This Month
                </span>

                <strong>—</strong>

                <small>
                  Data unavailable
                </small>
              </div>
            </article>

            <article className="hero-kpi">
              <span className="hero-kpi-icon">
                <Activity size={19} />
              </span>

              <div>
                <span>Returning</span>

                <strong>
                  {repeatCustomers}
                </strong>

                <small>
                  {returningRate}% return rate
                </small>
              </div>
            </article>

          </div>
        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="summary-grid">

          <article className="summary-card">
            <span className="summary-icon">
              <Users size={19} />
            </span>

            <div>
              <span>
                Total Customers
              </span>

              <strong>
                {customers.length}
              </strong>

              <small>
                Customer records available
              </small>
            </div>
          </article>

          <article className="summary-card">
            <span className="summary-icon active">
              <UserCheck size={19} />
            </span>

            <div>
              <span>
                Active Members
              </span>

              <strong>
                {activeCustomers}
              </strong>

              <small>
                Currently marked active
              </small>
            </div>
          </article>

          <article className="summary-card">
            <span className="summary-icon new">
              <UserPlus size={19} />
            </span>

            <div>
              <span>
                New Customers
              </span>

              <strong>—</strong>

              <small>
                Acquisition data unavailable
              </small>
            </div>
          </article>

          <article className="summary-card">
            <span className="summary-icon returning">
              <Activity size={19} />
            </span>

            <div>
              <span>
                Repeat Customers
              </span>

              <strong>
                {repeatCustomers}
              </strong>

              <small>
                Multiple bookings
              </small>
            </div>
          </article>

        </section>

        {/* =================================================
            INSIGHTS
        ================================================= */}

        <section className="customer-insights">

          <header className="section-heading">

            <div>
              <span className="section-eyebrow">
                CRM INSIGHTS
              </span>

              <h2>
                Customer Intelligence
              </h2>
            </div>

            <p>
              Relationship and engagement
              signals at a glance.
            </p>

          </header>

          <div className="insights-grid">

            <article className="insight-item">
              <span className="insight-icon">
                <Activity size={18} />
              </span>

              <div>
                <span>
                  Most Active Customer
                </span>

                <strong>
                  {mostActiveCustomer?.name ??
                    "Unavailable"}
                </strong>

                <small>
                  {mostActiveCustomer
                    ? `${mostActiveCustomer.bookings} lifetime bookings`
                    : "No customer data"}
                </small>
              </div>
            </article>

            <article className="insight-item">
              <span className="insight-icon">
                <Users size={18} />
              </span>

              <div>
                <span>
                  Returning Customer Rate
                </span>

                <strong>
                  {returningRate}%
                </strong>

                <small>
                  {repeatCustomers} repeat customers
                </small>
              </div>
            </article>

            <article className="insight-item">
              <span className="insight-icon">
                <UserPlus size={18} />
              </span>

              <div>
                <span>
                  New This Week
                </span>

                <strong>—</strong>

                <small>
                  Acquisition data unavailable
                </small>
              </div>
            </article>

            <article className="insight-item">
              <span className="insight-icon">
                <CalendarDays size={18} />
              </span>

              <div>
                <span>
                  Total Bookings
                </span>

                <strong>
                  {totalBookings}
                </strong>

                <small>
                  Across all customer records
                </small>
              </div>
            </article>

          </div>
        </section>

        {/* =================================================
            DIRECTORY
        ================================================= */}

        <section className="customer-directory">

          <div className="customer-list-card">

            <header className="list-card-header">

              <div>
                <span className="section-eyebrow">
                  CRM DIRECTORY
                </span>

                <h2>
                  Customer Profiles
                </h2>

                <p>
                  Browse customers and open a
                  profile for more context.
                </p>
              </div>

              <button
                className="secondary-btn"
                type="button"
                onClick={() => {
                  document
                    .querySelector(
                      ".filter-toolbar",
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                }}
              >
                <Filter size={16} />
                Filters
              </button>

            </header>

            {/* SEARCH */}

            <div className="filter-toolbar">
              <div className="filter-controls">

                <span className="filter-label">
                  <Filter size={15} />
                  Refine
                </span>

                <label>
                  <PartnerSelect
                    value={
                      membershipFilter
                    }
                    onValueChange={(value) =>
                      setMembershipFilter(
                        value,
                      )
                    }
                  >
                    <option value="All">
                      All memberships
                    </option>

                    <option value="Unavailable">
                      Membership unavailable
                    </option>
                  </PartnerSelect>
                </label>

                <label>
                  <PartnerSelect
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(
                        value as StatusFilter,
                      )
                    }
                  >
                    <option value="All">
                      All statuses
                    </option>

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </PartnerSelect>
                </label>

                <label>
                  <PartnerSelect
                    value={activityFilter}
                    onValueChange={(value) =>
                      setActivityFilter(
                        value as ActivityFilter,
                      )
                    }
                  >
                    <option value="All">
                      All activity
                    </option>

                    <option value="New">
                      New
                    </option>

                    <option value="Frequent">
                      Frequent
                    </option>

                    <option value="Occasional">
                      Occasional
                    </option>
                  </PartnerSelect>
                </label>

              </div>
            </div>

            {/* ACTIVE FILTERS */}

            {activeFilters.length > 0 && (
              <div className="active-filter-row">

                <div className="filter-chips">

                  {activeFilters.map(
                    (filter) => (
                      <button
                        type="button"
                        className="filter-chip"
                        key={filter.key}
                        onClick={
                          filter.clear
                        }
                      >
                        {filter.label}

                        <X size={13} />
                      </button>
                    ),
                  )}

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

            {/* ERROR */}

            {error &&
              !showCustomerModal && (
                <div
                  style={{
                    margin: "12px 0",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#fff1f1",
                    color: "#b42318",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}

            {/* CUSTOMERS */}

            {loading ? (
              <div className="customer-loading">
                <div className="loading-card" />
                <div className="loading-card" />
              </div>
            ) : visibleCustomers.length === 0 ? (
              <div className="customer-empty">

                <span>
                  <Users size={25} />
                </span>

                <h3>
                  No customers found
                </h3>

                <p>
                  Adjust your search or
                  filters to see more
                  profiles.
                </p>

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

                {visibleCustomers.map(
                  (customer) => {
                    const activityLevel =
                      getActivityLevel(
                        customer.bookings,
                      );

                    const isSelected =
                      selectedCustomerId ===
                      customer.id;

                    return (
                      <article
                        className={`customer-profile-card ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        key={customer.id}
                        onClick={() =>
                          viewCustomerProfile(
                            customer,
                          )
                        }
                      >

                        {/* CARD HEADER */}

                        <header className="profile-card-header">

                          <div className="profile-card-identity">

                            <CustomerAvatar
                              customer={customer}
                              size="large"
                            />

                            <div>

                              <div className="customer-name-row">

                                <h3>
                                  {customer.name}
                                </h3>

                                <StatusBadge
                                  status={
                                    customer.status
                                  }
                                />

                              </div>

                              <span
                                className={`activity-chip activity-${activityLevel.toLowerCase()}`}
                              >
                                {activityLevel ===
                                "New"
                                  ? "New customer"
                                  : `${activityLevel} customer`}
                              </span>

                            </div>

                          </div>

                          {/* MENU */}

                          <div
                            className="profile-menu"
                            ref={
                              openMenuId ===
                              customer.id
                                ? actionMenuRef
                                : undefined
                            }
                          >

                            <button
                              type="button"
                              className="action-menu-trigger"
                              aria-label={`Open actions for ${customer.name}`}
                              onClick={(
                                event,
                              ) => {
                                event.stopPropagation();

                                setOpenMenuId(
                                  openMenuId ===
                                    customer.id
                                    ? null
                                    : customer.id,
                                );
                              }}
                            >
                              <MoreHorizontal
                                size={18}
                              />
                            </button>

                            {openMenuId ===
                              customer.id && (
                              <div className="action-menu">

                                <button
                                  type="button"
                                  onClick={(
                                    event,
                                  ) => {
                                    event.stopPropagation();

                                    viewCustomerProfile(
                                      customer,
                                    );
                                  }}
                                >
                                  <CircleUserRound
                                    size={15}
                                  />

                                  View Profile
                                </button>

                                <button
                                  type="button"
                                  onClick={(
                                    event,
                                  ) => {
                                    event.stopPropagation();

                                    openEditCustomer(
                                      customer,
                                    );
                                  }}
                                >
                                  <Edit3
                                    size={15}
                                  />

                                  Edit Customer
                                </button>

                                <button
                                  type="button"
                                  style={{
                                    color:
                                      "#b42318",
                                  }}
                                  onClick={(
                                    event,
                                  ) => {
                                    event.stopPropagation();

                                    deleteCustomer(
                                      customer,
                                    );
                                  }}
                                >
                                  <Trash2
                                    size={15}
                                  />

                                  Delete Customer
                                </button>

                                <button
                                  type="button"
                                  onClick={(
                                    event,
                                  ) => {
                                    event.stopPropagation();

                                    emailCustomer(
                                      customer,
                                    );
                                  }}
                                >
                                  <Mail
                                    size={15}
                                  />

                                  Send Email
                                </button>

                                <button
                                  type="button"
                                  onClick={(
                                    event,
                                  ) => {
                                    event.stopPropagation();

                                    callCustomer(
                                      customer,
                                    );
                                  }}
                                >
                                  <Phone
                                    size={15}
                                  />

                                  Call Customer
                                </button>

                              </div>
                            )}

                          </div>
                        </header>

                        {/* CONTACT */}

                        <div className="profile-contact-grid">

                          <button
                            type="button"
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              emailCustomer(
                                customer,
                              );
                            }}
                          >
                            <span className="contact-icon">
                              <Mail size={15} />
                            </span>

                            <span>
                              <small>
                                Email
                              </small>

                              <strong>
                                {customer.email}
                              </strong>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              callCustomer(
                                customer,
                              );
                            }}
                          >
                            <span className="contact-icon">
                              <Phone size={15} />
                            </span>

                            <span>
                              <small>
                                Phone
                              </small>

                              <strong>
                                {customer.phone}
                              </strong>
                            </span>
                          </button>

                        </div>

                        {/* DETAILS */}

                        <dl className="profile-detail-grid">

                          <div>
                            <dt>
                              Membership
                            </dt>

                            <dd>
                              {customer.membership ??
                                "Not available"}
                            </dd>
                          </div>

                          <div>
                            <dt>
                              Favourite Court
                            </dt>

                            <dd>
                              {customer.favoriteCourt ??
                                "Not available"}
                            </dd>
                          </div>

                        </dl>

                        {/* PERFORMANCE */}

                        <div className="profile-performance">

                          <article>
                            <span>
                              Lifetime
                              Bookings
                            </span>

                            <strong>
                              {customer.bookings}
                            </strong>
                          </article>

                          <article>
                            <span>
                              Last Visit
                            </span>

                            <strong>
                              {formatDate(
                                customer.lastVisit,
                              )}
                            </strong>
                          </article>

                          <article>
                            <span>
                              Customer Value
                            </span>

                            <strong>
                              ₹
                              {customer.totalSpent.toLocaleString(
                                "en-IN",
                              )}
                            </strong>
                          </article>

                        </div>

                        {/* FOOTER */}

                        <footer className="profile-card-actions">

                          <button
                            type="button"
                            className="view-profile-btn"
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              viewCustomerProfile(
                                customer,
                              );
                            }}
                          >
                            <CircleUserRound
                              size={15}
                            />

                            View Profile
                          </button>

                          <button
                            type="button"
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              emailCustomer(
                                customer,
                              );
                            }}
                          >
                            <Mail size={15} />

                            Contact
                          </button>

                        </footer>

                      </article>
                    );
                  },
                )}

              </div>
            )}

            {/* PAGINATION */}

            <footer className="pagination">

              <p>
                Showing{" "}
                {filteredCustomers.length
                  ? (currentPage - 1) *
                      PAGE_SIZE +
                    1
                  : 0}{" "}
                to{" "}
                {Math.min(
                  currentPage *
                    PAGE_SIZE,
                  filteredCustomers.length,
                )}{" "}
                of{" "}
                {filteredCustomers.length}{" "}
                customers
              </p>

              <div className="pagination-controls">

                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1,
                        ),
                    )
                  }
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from(
                  {
                    length: pageCount,
                  },
                  (_, index) => {
                    const page =
                      index + 1;

                    return (
                      <button
                        type="button"
                        className={
                          currentPage ===
                          page
                            ? "active"
                            : ""
                        }
                        key={page}
                        onClick={() =>
                          setCurrentPage(
                            page,
                          )
                        }
                      >
                        {page}
                      </button>
                    );
                  },
                )}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    pageCount
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          pageCount,
                          page + 1,
                        ),
                    )
                  }
                >
                  <ChevronRight size={16} />
                </button>

              </div>
            </footer>

          </div>

          {/* =================================================
              RIGHT PROFILE
          ================================================= */}

          {selectedCustomer && (
            <aside
              ref={profileRef}
              className="customer-preview"
            >

              <header className="preview-header">

                <CustomerAvatar
                  customer={
                    selectedCustomer
                  }
                  size="large"
                />

                <div className="preview-identity">

                  <span className="section-eyebrow">
                    CUSTOMER PROFILE
                  </span>

                  <h2>
                    {selectedCustomer.name}
                  </h2>

                  <StatusBadge
                    status={
                      selectedCustomer.status
                    }
                  />

                </div>
              </header>

              {/* CONTACT BUTTONS */}

              <div className="preview-contact-actions">

                <button
                  type="button"
                  onClick={() =>
                    emailCustomer(
                      selectedCustomer,
                    )
                  }
                >
                  <Mail size={16} />
                  Email
                </button>

                <button
                  type="button"
                  onClick={() =>
                    callCustomer(
                      selectedCustomer,
                    )
                  }
                >
                  <Phone size={16} />
                  Call
                </button>

              </div>

              {/* CONTACT INFORMATION */}

              <section className="preview-section">

                <h3>
                  Contact Information
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    emailCustomer(
                      selectedCustomer,
                    )
                  }
                >
                  <Mail size={15} />

                  <span>
                    <small>
                      Email
                    </small>

                    <strong>
                      {
                        selectedCustomer.email
                      }
                    </strong>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    callCustomer(
                      selectedCustomer,
                    )
                  }
                >
                  <Phone size={15} />

                  <span>
                    <small>
                      Phone
                    </small>

                    <strong>
                      {
                        selectedCustomer.phone
                      }
                    </strong>
                  </span>
                </button>

              </section>

              {/* BOOKING SUMMARY */}

              <section className="preview-section">

                <h3>
                  Booking Summary
                </h3>

                <div className="preview-stat-grid">

                  <div>
                    <span>
                      Total Bookings
                    </span>

                    <strong>
                      {
                        selectedCustomer.bookings
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Activity
                    </span>

                    <strong>
                      {getActivityLevel(
                        selectedCustomer.bookings,
                      )}
                    </strong>
                  </div>

                </div>
              </section>

              {/* RELATIONSHIP */}

              <section className="preview-section">

                <h3>
                  Relationship
                </h3>

                <dl className="preview-details">

                  <div>
                    <dt>
                      Membership
                    </dt>

                    <dd>
                      {
                        selectedCustomer.membership ??
                        "Not available"
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Favourite Court
                    </dt>

                    <dd>
                      {
                        selectedCustomer.favoriteCourt ??
                        "Not available"
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Last Visit
                    </dt>

                    <dd>
                      {formatDate(
                        selectedCustomer.lastVisit,
                      )}
                    </dd>
                  </div>

                </dl>
              </section>

              {/* RECENT ACTIVITY */}

              <section className="preview-section recent-activity">

                <h3>
                  Recent Activity
                </h3>

                <div className="preview-empty">

                  <CalendarDays
                    size={19}
                  />

                  <div>

                    <strong>
                      No activity available
                    </strong>

                    <p>
                      Recent customer
                      activity is not
                      included in the
                      current API response.
                    </p>

                  </div>

                </div>

              </section>

            </aside>
          )}

        </section>
      </main>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showCustomerModal && (
        <div
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              if (!saving) {
                setShowCustomerModal(
                  false,
                );
              }
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background:
              "rgba(0,0,0,0.45)",
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              borderRadius: "20px",
              padding: "28px",
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.25)",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                marginBottom: "24px",
              }}
            >

              <div>

                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing:
                      "0.12em",
                    color: "#0a5c45",
                    marginBottom: "6px",
                  }}
                >
                  CUSTOMER MANAGEMENT
                </span>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                  }}
                >
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setShowCustomerModal(
                    false,
                  )
                }
                style={{
                  border: "none",
                  background: "#f3f5f2",
                  borderRadius: "50%",
                  width: "38px",
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>

            </div>

            {error && (
              <div
                style={{
                  padding: "12px",
                  marginBottom: "16px",
                  borderRadius: "10px",
                  background: "#fff1f1",
                  color: "#b42318",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >

              {/* NAME */}

              <label
                style={{
                  display: "grid",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Name *
                </span>

                <input
                  type="text"
                  value={
                    customerForm.name
                  }
                  placeholder="Enter customer name"
                  disabled={saving}
                  onChange={(event) =>
                    setCustomerForm(
                      (current) => ({
                        ...current,
                        name: event.target
                          .value,
                      }),
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d9ded8",
                    borderRadius:
                      "10px",
                    outline: "none",
                    fontSize: "14px",
                  }}
                />
              </label>

              {/* EMAIL */}

              <label
                style={{
                  display: "grid",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Email *
                </span>

                <input
                  type="email"
                  value={
                    customerForm.email
                  }
                  placeholder="customer@example.com"
                  disabled={saving}
                  onChange={(event) =>
                    setCustomerForm(
                      (current) => ({
                        ...current,
                        email:
                          event.target.value,
                      }),
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d9ded8",
                    borderRadius:
                      "10px",
                    outline: "none",
                    fontSize: "14px",
                  }}
                />
              </label>

              {/* PHONE */}

              <label
                style={{
                  display: "grid",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Phone *
                </span>

                <input
                  type="tel"
                  value={
                    customerForm.phone
                  }
                  placeholder="9876501234"
                  disabled={saving}
                  onChange={(event) =>
                    setCustomerForm(
                      (current) => ({
                        ...current,
                        phone:
                          event.target.value,
                      }),
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #d9ded8",
                    borderRadius:
                      "10px",
                    outline: "none",
                    fontSize: "14px",
                  }}
                />
              </label>

            </div>

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: "10px",
                marginTop: "26px",
              }}
            >

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setShowCustomerModal(
                    false,
                  )
                }
                style={{
                  padding:
                    "11px 18px",
                  border:
                    "1px solid #d9ded8",
                  background: "#ffffff",
                  borderRadius: "10px",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={saveCustomer}
                style={{
                  padding:
                    "11px 20px",
                  border: "none",
                  background: "#c8ff3d",
                  color: "#123c2d",
                  borderRadius: "10px",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: 700,
                }}
              >
                {saving
                  ? "Saving..."
                  : editingCustomer
                    ? "Save Changes"
                    : "Add Customer"}
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
