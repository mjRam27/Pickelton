"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AirVent,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleParking,
  Clock3,
  Droplets,
  Dumbbell,
  IndianRupee,
  Lightbulb,
  Pencil,
  Sofa,
  UsersRound,
} from "lucide-react";
import PartnerSelect from "@/components/partner/PartnerSelect";
import "./page.css";

type CourtStatus =
  | "Available"
  | "Occupied"
  | "Maintenance";

type SlotStatus =
  | "available"
  | "booked"
  | "maintenance";

type SortOption =
  | "Default"
  | "Name A-Z"
  | "Name Z-A"
  | "Price Low-High"
  | "Price High-Low";

type BackendCourt = {
  id: string;
  name: string;
  sport: string;
  surface?: string | null;
  indoor: boolean;
  membership_enabled: boolean;
  hourly_rate: number;
  description?: string | null;
  status:
    | "ACTIVE"
    | "MAINTENANCE"
    | "INACTIVE";
  created_at?: string;
  updated_at?: string;
};

type Court = {
  id: string;
  number: string;
  name: string;
  type: "Indoor" | "Outdoor";
  status: CourtStatus;
  price: string;
  priceValue: number;
  surface: string;
  capacity: string;
  amenities: string[];
  next: string;
  revenue: string;
  occupancy: number;
  image: string;
  membershipEnabled: boolean;
};

const COURT_IMAGES = [
  "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=1200&q=85",
];

const scheduleSlots: SlotStatus[] = [
  "available",
  "booked",
  "booked",
  "available",
  "available",
  "booked",
];

function AmenityIcon({
  amenity,
}: {
  amenity: string;
}) {
  const props = {
    size: 13,
    strokeWidth: 2,
    "aria-hidden": true,
  } as const;

  switch (amenity) {
    case "AC":
      return <AirVent {...props} />;

    case "Lighting":
      return <Lightbulb {...props} />;

    case "Parking":
      return <CircleParking {...props} />;

    case "Water":
      return <Droplets {...props} />;

    case "Seating":
      return <Sofa {...props} />;

    case "Coaching":
      return <Dumbbell {...props} />;

    default:
      return <UsersRound {...props} />;
  }
}

function getCourtStatus(
  court: BackendCourt,
): CourtStatus {
  if (court.status === "MAINTENANCE") {
    return "Maintenance";
  }

  if (court.status === "INACTIVE") {
    return "Maintenance";
  }

  return "Available";
}

function formatPrice(value: number) {
  return `₹${Number(value).toLocaleString(
    "en-IN",
  )}/hr`;
}

function getCourtNumber(index: number) {
  return `C-${String(index + 1).padStart(2, "0")}`;
}

function getCourtImage(index: number) {
  return COURT_IMAGES[
    index % COURT_IMAGES.length
  ];
}

function convertCourt(
  court: BackendCourt,
  index: number,
): Court {
  const status = getCourtStatus(court);

  const amenities: string[] = [];

  if (court.indoor) {
    amenities.push("AC");
  } else {
    amenities.push("Lighting");
  }

  if (court.surface) {
    const surface =
      court.surface.toLowerCase();

    if (surface.includes("synthetic")) {
      amenities.push("Water");
    } else if (
      surface.includes("acrylic")
    ) {
      amenities.push("Lighting");
    } else {
      amenities.push("Seating");
    }
  }

  return {
    id: court.id,
    number: getCourtNumber(index),
    name: court.name,
    type: court.indoor
      ? "Indoor"
      : "Outdoor",
    status,
    price: formatPrice(
      court.hourly_rate,
    ),
    priceValue: Number(
      court.hourly_rate,
    ),
    surface:
      court.surface ||
      "Not specified",
    capacity: "4 players",
    amenities: [
      ...new Set(amenities),
    ],
    next:
      status === "Maintenance"
        ? "Court unavailable"
        : "No upcoming booking",
    revenue: "₹0",
    occupancy: 0,
    image: getCourtImage(index),
    membershipEnabled: court.membership_enabled,
  };
}

export default function CourtsPage() {
  const router = useRouter();

  const [courts, setCourts] =
    useState<Court[]>([]);

  const [filter, setFilter] =
    useState("All Courts");

  const [sortBy, setSortBy] =
    useState<SortOption>("Default");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * DELETE COURT
   */
  const handleDeleteCourt = async (
    courtId: string,
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this court?",
      );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "partner_token",
        );

      if (!token) {
        alert(
          "Partner login session not found.",
        );
        return;
      }

      const response =
        await fetch(
          `http://localhost:8090/api/v1/courts/${courtId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

      if (!response.ok) {
        const result =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          result?.error?.message ||
            "Failed to delete court",
        );
      }

      setCourts(
        (currentCourts) =>
          currentCourts.filter(
            (court) =>
              court.id !== courtId,
          ),
      );
    } catch (err) {
      console.error(
        "Failed to delete court:",
        err,
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete court",
      );
    }
  };

  /*
   * LOAD COURTS
   */
  useEffect(() => {
    async function loadCourts() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem(
            "partner_token",
          );

        if (!token) {
          setError(
            "Partner login session not found.",
          );
          return;
        }

        const response =
          await fetch(
            "http://localhost:8090/api/v1/courts?page=0&size=100",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error?.message ||
              "Failed to load courts",
          );
        }

        const rows: BackendCourt[] =
          result?.data?.content ??
          result?.data ??
          [];

        setCourts(
          rows.map(convertCourt),
        );
      } catch (err) {
        console.error(
          "Failed to load courts:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load courts",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCourts();
  }, []);

  /*
   * FILTER + SORT
   */
  const filteredCourts =
    useMemo(() => {
      const result =
        courts.filter((court) => {
          let matchesFilter =
            true;

          if (filter === "Indoor") {
            matchesFilter =
              court.type === "Indoor";
          }

          if (filter === "Outdoor") {
            matchesFilter =
              court.type === "Outdoor";
          }

          if (filter === "Available") {
            matchesFilter =
              court.status ===
              "Available";
          }

          if (filter === "Maintenance") {
            matchesFilter =
              court.status ===
              "Maintenance";
          }

          return matchesFilter;
        });

      return [...result].sort(
        (a, b) => {
          switch (sortBy) {
            case "Name A-Z":
              return a.name.localeCompare(
                b.name,
              );

            case "Name Z-A":
              return b.name.localeCompare(
                a.name,
              );

            case "Price Low-High":
              return (
                a.priceValue -
                b.priceValue
              );

            case "Price High-Low":
              return (
                b.priceValue -
                a.priceValue
              );

            default:
              return 0;
          }
        },
      );
    }, [
      courts,
      filter,
      sortBy,
    ]);

  /*
   * KPI DATA
   */
  const totalCourts =
    courts.length;

  const activeCourts =
    courts.filter(
      (court) =>
        court.status !==
        "Maintenance",
    ).length;

  const availableCourts =
    courts.filter(
      (court) =>
        court.status ===
        "Available",
    ).length;

  const occupiedCourts =
    courts.filter(
      (court) =>
        court.status ===
        "Occupied",
    ).length;

  const maintenanceCourts =
    courts.filter(
      (court) =>
        court.status ===
        "Maintenance",
    ).length;

  const indoorCourts =
    courts.filter(
      (court) =>
        court.type === "Indoor",
    ).length;

  const outdoorCourts =
    courts.filter(
      (court) =>
        court.type === "Outdoor",
    ).length;

  /*
   * MANAGE SCHEDULE
   */
  const handleManageSchedule =
    () => {
      if (courts.length === 0) {
        alert(
          "Please add a court before managing the schedule.",
        );
        return;
      }

      router.push(
        `/partner/courts/${courts[0].id}/schedule`,
      );
    };

  return (
    <main className="courts-page">

      {/* =========================
          HERO
      ========================== */}

      <section className="courts-hero">

        <div className="hero-copy">

          <span className="eyebrow">
            COURT MANAGEMENT
          </span>

          <div className="hero-title-row">

            <div>
              <h1>
                Courts
              </h1>

              <p>
                Manage availability,
                pricing and daily
                operations.
              </p>
            </div>

            <button
              type="button"
              className="add-court"
              onClick={() =>
                router.push(
                  "/partner/courts/add",
                )
              }
            >
              <span aria-hidden="true">
                +
              </span>

              Add Court
            </button>

          </div>

          {/* FILTERS */}

          <div
            className="filter-chips"
            aria-label="Court filters"
          >

            {[
              "All Courts",
              "Indoor",
              "Outdoor",
              "Available",
              "Maintenance",
            ].map((item) => (
              <button
                key={item}
                type="button"
                className={
                  filter === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter(item)
                }
              >
                {item}
              </button>
            ))}

          </div>

          {/* KPIs */}

          <div className="hero-kpis">

            <article>
              <span>
                Total Courts
              </span>

              <strong>
                {totalCourts}
              </strong>
            </article>

            <article>
              <span>
                Active
              </span>

              <strong>
                {activeCourts}
              </strong>
            </article>

            <article>
              <span>
                Available
              </span>

              <strong>
                {availableCourts}
              </strong>
            </article>

            <article>
              <span>
                Occupied
              </span>

              <strong>
                {occupiedCourts}
              </strong>
            </article>

            <article>
              <span>
                Maintenance
              </span>

              <strong>
                {maintenanceCourts}
              </strong>
            </article>

            <article>
              <span>
                Avg. Utilization
              </span>

              <strong>
                —
              </strong>
            </article>

          </div>

        </div>

        {/* HERO OVERVIEW */}

        <aside className="hero-overview">

          <div className="occupancy-head">

            <div>
              <span>
                Today's occupancy
              </span>

              <strong>
                —
              </strong>
            </div>

            <span className="trend">
              Live
            </span>

          </div>

          <div
            className="hero-progress"
            role="progressbar"
            aria-label="Today's court occupancy"
            aria-valuenow={0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span />
          </div>

          <div className="hero-metrics">

            <article>
              <span>
                Revenue today
              </span>

              <strong>
                —
              </strong>

              <small>
                Live bookings will
                appear here
              </small>
            </article>

            <article>
              <span>
                Courts
              </span>

              <strong>
                {totalCourts}
              </strong>

              <small>
                Real courts
              </small>
            </article>

          </div>

          <div className="hero-summary">

            <CheckCircle2
              size={17}
              aria-hidden="true"
            />

            <div>

              <strong>
                {loading
                  ? "Loading courts"
                  : error
                    ? "Unable to load courts"
                    : "Operations connected"}
              </strong>

              <p>
                {loading
                  ? "Fetching courts from the Pickelton backend."
                  : error
                    ? error
                    : "Court inventory is using your real partner data."}
              </p>

            </div>

          </div>

        </aside>

      </section>

      {/* =========================
          COURT INVENTORY
      ========================== */}

      <section className="panel inventory-panel">

        <header className="section-header">

          <div>

            <span className="eyebrow">
              COURT INVENTORY
            </span>

            <h2>
              Live Courts
            </h2>

            <p>
              Current availability,
              bookings and daily
              performance.
            </p>

          </div>

          {/* SORT */}

          <div className="court-sort-control">
            <PartnerSelect
              aria-label="Sort courts"
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as SortOption)
              }
            >
              <option value="Default">Default</option>
              <option value="Name A-Z">Name A-Z</option>
              <option value="Name Z-A">Name Z-A</option>
              <option value="Price Low-High">Price Low-High</option>
              <option value="Price High-Low">Price High-Low</option>
            </PartnerSelect>
          </div>

        </header>

        {loading && (
          <div className="state-message">
            Loading your courts...
          </div>
        )}

        {!loading && error && (
          <div className="state-message error-message">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          filteredCourts.length ===
            0 && (
            <div className="state-message">
              {courts.length === 0
                ? "No courts found. Add your first court."
                : "No courts match the selected filter."}
            </div>
          )}

        <div className="court-grid">

          {filteredCourts.map(
            (court) => {

              const isMaintenance =
                court.status ===
                "Maintenance";

              return (
                <article
                  className={`court-card court-card-${court.status.toLowerCase()}`}
                  key={court.id}
                >

                  {/* IMAGE */}

                  <div className="court-image">

                    <img
                      src={court.image}
                      alt={`${court.name} pickleball court`}
                    />

                    <div className="court-image-overlay" />

                    <div className="court-image-top">

                      <span className="court-number">
                        {court.number}
                      </span>

                      <span
                        className={`status-badge ${court.status.toLowerCase()}`}
                      >
                        <i aria-hidden="true" />
                        {court.status}
                      </span>

                    </div>

                  </div>

                  {/* BODY */}

                  <div className="court-card-body">

                    <header className="court-identity">

                      <div>

                        <span>
                          {court.type}
                        </span>

                        <h3>
                          {court.name}
                        </h3>

                      </div>

                      <div className="court-price">

                        <span>
                          Hourly rate
                        </span>

                        <strong>
                          {court.price}
                        </strong>

                      </div>

                    </header>

                    {/* META */}

                    <div className="court-meta">

                      <span>

                        <span className="meta-icon">

                          <Dumbbell
                            size={14}
                            aria-hidden="true"
                          />

                        </span>

                        <span>

                          <small>
                            Surface
                          </small>

                          <strong>
                            {court.surface}
                          </strong>

                        </span>

                      </span>

                      <span>

                        <span className="meta-icon">

                          <UsersRound
                            size={14}
                            aria-hidden="true"
                          />

                        </span>

                        <span>

                          <small>
                            Capacity
                          </small>

                          <strong>
                            {court.capacity}
                          </strong>

                        </span>

                      </span>

                    </div>

                    <div className={`membership-status ${court.membershipEnabled ? "is-enabled" : ""}`}>
                      <UsersRound size={14} aria-hidden="true" />
                      {court.membershipEnabled
                        ? "Membership Available"
                        : "Membership Not Available"}
                    </div>

                    {/* AMENITIES */}

                    <div className="amenities">

                      {court.amenities.map(
                        (amenity) => (
                          <span
                            key={
                              amenity
                            }
                          >
                            <AmenityIcon
                              amenity={
                                amenity
                              }
                            />

                            {amenity}
                          </span>
                        ),
                      )}

                    </div>

                    {/* BOOKING */}

                    <section
                      className={`booking-widget ${
                        isMaintenance
                          ? "is-blocked"
                          : ""
                      }`}
                    >

                      <span className="booking-icon">

                        <CalendarClock
                          size={16}
                          aria-hidden="true"
                        />

                      </span>

                      <div>

                        <small>
                          {isMaintenance
                            ? "Court unavailable"
                            : "Upcoming booking"}
                        </small>

                        <strong>
                          {isMaintenance
                            ? "Maintenance"
                            : "No upcoming booking"}
                        </strong>

                      </div>

                      {!isMaintenance && (
                        <span className="booking-time">

                          <Clock3
                            size={13}
                            aria-hidden="true"
                          />

                          —

                        </span>
                      )}

                    </section>

                    {/* PERFORMANCE */}

                    <div className="performance-strip">

                      <div className="revenue-metric">

                        <span className="metric-icon">

                          <IndianRupee
                            size={16}
                            aria-hidden="true"
                          />

                        </span>

                        <span>

                          <small>
                            Revenue today
                          </small>

                          <strong>
                            {court.revenue}
                          </strong>

                        </span>

                      </div>

                      <div className="occupancy-metric">

                        <div>

                          <small>
                            Occupancy
                          </small>

                          <strong>
                            {court.occupancy
                              ? `${court.occupancy}%`
                              : "—"}
                          </strong>

                        </div>

                        <div
                          className="court-progress"
                          role="progressbar"
                          aria-label={`${court.name} occupancy`}
                          aria-valuenow={
                            court.occupancy
                          }
                          aria-valuemin={
                            0
                          }
                          aria-valuemax={
                            100
                          }
                        >

                          <span
                            style={{
                              width: `${court.occupancy}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <footer className="court-actions">

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/partner/courts/edit/${court.id}`,
                          )
                        }
                      >

                        <Pencil
                          size={15}
                          aria-hidden="true"
                        />

                        Edit Court

                      </button>

                      <button
                        type="button"
                        className="delete-court-button"
                        onClick={() =>
                          handleDeleteCourt(
                            court.id,
                          )
                        }
                      >
                        Delete
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/partner/courts/${court.id}/schedule`,
                          )
                        }
                      >

                        <CalendarClock
                          size={15}
                          aria-hidden="true"
                        />

                        View Schedule

                        <ArrowUpRight
                          size={14}
                          aria-hidden="true"
                        />

                      </button>

                    </footer>

                  </div>

                </article>
              );
            },
          )}

        </div>

      </section>

      {/* =========================
          TODAY'S SCHEDULE
      ========================== */}

      <section className="panel schedule-panel">

        <header className="section-header">

          <div>

            <span className="eyebrow">
              TODAY'S OPERATIONS
            </span>

            <h2>
              Availability Schedule
            </h2>

            <p>
              Live availability
              across today's
              slots.
            </p>

          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={
              handleManageSchedule
            }
          >
            Manage Schedule
          </button>

        </header>

        <div className="schedule-scroll">

          <table>

            <thead>

              <tr>

                <th scope="col">
                  Court
                </th>

                <th scope="col">
                  8 AM
                </th>

                <th scope="col">
                  9 AM
                </th>

                <th scope="col">
                  10 AM
                </th>

                <th scope="col">
                  11 AM
                </th>

                <th scope="col">
                  12 PM
                </th>

                <th scope="col">
                  1 PM
                </th>

              </tr>

            </thead>

            <tbody>

              {courts.length >
              0 ? (
                courts.map(
                  (court) => (
                    <tr
                      key={
                        court.id
                      }
                    >

                      <th scope="row">
                        {court.name}
                      </th>

                      {scheduleSlots.map(
                        (
                          slot,
                          index,
                        ) => (
                          <td
                            key={`${court.id}-${index}`}
                          >

                            <span
                              className={
                                court.status ===
                                "Maintenance"
                                  ? "maintenance"
                                  : slot
                              }
                            >
                              {court.status ===
                              "Maintenance"
                                ? "Maintenance"
                                : slot ===
                                    "available"
                                  ? "Available"
                                  : "Booked"}
                            </span>

                          </td>
                        ),
                      )}

                    </tr>
                  ),
                )
              ) : (
                <tr>

                  <th scope="row">
                    No courts
                  </th>

                  <td colSpan={6}>
                    Add a court to
                    see the
                    schedule.
                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

        <footer className="schedule-legend">

          <span>
            <i className="available" />
            Available
          </span>

          <span>
            <i className="booked" />
            Booked
          </span>

          <span>
            <i className="maintenance" />
            Maintenance
          </span>

        </footer>

      </section>

      {/* =========================
          UTILIZATION / OCCUPANCY
      ========================== */}

      <section className="analytics-grid">

        {/* OCCUPANCY ONLY */}

        <article
          className="panel analytics-card occupancy-card"
          style={{
            gridColumn:
              "1 / -1",
          }}
        >

          <header>

            <div>

              <span className="eyebrow">
                UTILIZATION
              </span>

              <h2>
                Occupancy
              </h2>

            </div>

            <strong>
              —
            </strong>

          </header>

          <div className="occupancy-content">

            <div className="ring-chart">

              <div>

                <strong>
                  —
                </strong>

                <span>
                  Average
                </span>

              </div>

            </div>

            <ul>

              <li>

                <span>
                  Indoor courts
                </span>

                <strong>
                  {indoorCourts}
                </strong>

              </li>

              <li>

                <span>
                  Outdoor courts
                </span>

                <strong>
                  {outdoorCourts}
                </strong>

              </li>

              <li>

                <span>
                  Total courts
                </span>

                <strong>
                  {totalCourts}
                </strong>

              </li>

            </ul>

          </div>

        </article>

      </section>

      {/* =========================
          TOP PERFORMING COURTS
      ========================== */}

      <section className="panel ranking-panel">

        <header className="section-header">

          <div>

            <span className="eyebrow">
              PERFORMANCE
            </span>

            <h2>
              Top Performing Courts
            </h2>

            <p>
              Revenue and
              utilization leaders
              this week.
            </p>

          </div>

          <span className="period-chip">
            This week
          </span>

        </header>

        <div className="ranking-list">

          {courts
            .slice(0, 3)
            .map(
              (
                court,
                index,
              ) => (
                <article
                  key={
                    court.id
                  }
                >

                  <span className="rank">
                    0{index + 1}
                  </span>

                  <div className="ranking-name">

                    <strong>
                      {court.name}
                    </strong>

                    <small>
                      {court.type}
                    </small>

                  </div>

                  <div className="ranking-progress">

                    <div>

                      <span>
                        Occupancy
                      </span>

                      <strong>
                        {court.occupancy
                          ? `${court.occupancy}%`
                          : "—"}
                      </strong>

                    </div>

                    <div>

                      <span
                        style={{
                          width: `${court.occupancy}%`,
                        }}
                      />

                    </div>

                  </div>

                  <div className="ranking-revenue">

                    <span>
                      Revenue today
                    </span>

                    <strong>
                      {court.revenue}
                    </strong>

                  </div>

                  <span className="ranking-trend">
                    ↗
                  </span>

                </article>
              ),
            )}

        </div>

      </section>

      {/* =========================
          BOTTOM GRID
          OPERATIONS + TEAM ONLY
      ========================== */}

      <section
        className="bottom-grid"
        style={{
          gridTemplateColumns:
            "1fr 1fr",
        }}
      >

        {/* OPERATIONS */}

        <article className="panel operations-panel">

          <header className="section-header">

            <div>

              <span className="eyebrow">
                OPERATIONS
              </span>

              <h2>
                Today
              </h2>

            </div>

            <span className="live-status">

              <i />

              Live

            </span>

          </header>

          <div className="operations-summary">

            <article>

              <span>
                Courts
              </span>

              <strong>
                {totalCourts}
              </strong>

            </article>

            <article>

              <span>
                Available
              </span>

              <strong>
                {availableCourts}
              </strong>

            </article>

            <article>

              <span>
                Maintenance
              </span>

              <strong>
                {maintenanceCourts}
              </strong>

            </article>

          </div>

          <div className="activity-list">

            <article className="normal">

              <i />

              <div>

                <strong>
                  Court activity
                </strong>

                <p>
                  Live data from your
                  partner account
                </p>

              </div>

            </article>

            <article className="warning">

              <i />

              <div>

                <strong>
                  Court management
                </strong>

                <p>
                  Availability is
                  controlled from the
                  court records
                </p>

              </div>

            </article>

            <article className="success">

              <i />

              <div>

                <strong>
                  Backend connected
                </strong>

                <p>
                  Courts are loaded
                  from Pickelton API
                </p>

              </div>

            </article>

          </div>

        </article>

        {/* TEAM */}

        <article className="panel compact-panel">

          <header>

            <span className="eyebrow">
              TEAM
            </span>

            <h2>
              Staff on Duty
            </h2>

          </header>

          <div className="staff-list">

            <article>

              <span>
                AK
              </span>

              <div>

                <strong>
                  Arjun Kumar
                </strong>

                <p>
                  Venue Manager
                </p>

              </div>

              <i aria-label="Online" />

            </article>

            <article>

              <span>
                NP
              </span>

              <div>

                <strong>
                  Neha Patel
                </strong>

                <p>
                  Court Supervisor
                </p>

              </div>

              <i aria-label="Online" />

            </article>

            <article>

              <span>
                RS
              </span>

              <div>

                <strong>
                  Ravi Singh
                </strong>

                <p>
                  Maintenance
                </p>

              </div>

              <i aria-label="Online" />

            </article>

          </div>

        </article>

      </section>

    </main>
  );
}
