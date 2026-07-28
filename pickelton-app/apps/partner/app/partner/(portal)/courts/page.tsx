import {
  AirVent,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleParking,
  Clock3,
  Droplets,
  Dumbbell,
  IndianRupee,
  Lightbulb,
  Pencil,
  Search,
  Sofa,
  UsersRound,
} from "lucide-react";
import "./page.css";

type CourtStatus = "Available" | "Occupied" | "Maintenance";
type SlotStatus = "available" | "booked" | "maintenance";

const courts = [
  {
    id: 1,
    number: "C-01",
    name: "Centre Court",
    type: "Indoor",
    status: "Available" as CourtStatus,
    price: "₹700/hr",
    surface: "Cushioned acrylic",
    capacity: "4 players",
    amenities: ["AC", "Lighting", "Rental"],
    next: "Aarav Sharma · 10:00 AM",
    revenue: "₹6,300",
    occupancy: 88,
    image:
      "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 2,
    number: "C-02",
    name: "Championship Court",
    type: "Outdoor",
    status: "Occupied" as CourtStatus,
    price: "₹650/hr",
    surface: "Synthetic",
    capacity: "4 players",
    amenities: ["Lighting", "Seating", "Rental"],
    next: "Meera Kapoor · Playing now",
    revenue: "₹5,850",
    occupancy: 76,
    image:
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 3,
    number: "C-03",
    name: "Garden Court",
    type: "Outdoor",
    status: "Available" as CourtStatus,
    price: "₹600/hr",
    surface: "Acrylic",
    capacity: "4 players",
    amenities: ["Parking", "Water", "Lighting"],
    next: "Rohan Verma · 12:30 PM",
    revenue: "₹4,800",
    occupancy: 64,
    image:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 4,
    number: "C-04",
    name: "Training Court",
    type: "Indoor",
    status: "Maintenance" as CourtStatus,
    price: "₹550/hr",
    surface: "Polyurethane",
    capacity: "4 players",
    amenities: ["AC", "Coaching", "Rental"],
    next: "Blocked until 4:00 PM",
    revenue: "₹2,750",
    occupancy: 42,
    image:
      "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=1200&q=85",
  },
];

const kpis = [
  ["Total Courts", "6"],
  ["Active", "5"],
  ["Available", "4"],
  ["Occupied", "1"],
  ["Maintenance", "1"],
  ["Avg. Utilization", "78%"],
];

const schedule: { court: string; slots: SlotStatus[] }[] = [
  {
    court: "Centre Court",
    slots: [
      "available",
      "booked",
      "booked",
      "available",
      "available",
      "booked",
    ],
  },
  {
    court: "Championship",
    slots: [
      "booked",
      "booked",
      "available",
      "available",
      "booked",
      "booked",
    ],
  },
  {
    court: "Garden Court",
    slots: [
      "available",
      "available",
      "booked",
      "booked",
      "available",
      "available",
    ],
  },
  {
    court: "Training Court",
    slots: [
      "maintenance",
      "maintenance",
      "maintenance",
      "maintenance",
      "available",
      "available",
    ],
  },
];

const bookings = [
  {
    initials: "AS",
    customer: "Aarav Sharma",
    court: "Centre Court",
    time: "10:00–11:00 AM",
    status: "Confirmed",
  },
  {
    initials: "MK",
    customer: "Meera Kapoor",
    court: "Championship Court",
    time: "11:30 AM–12:30 PM",
    status: "Playing",
  },
  {
    initials: "RV",
    customer: "Rohan Verma",
    court: "Garden Court",
    time: "12:30–1:30 PM",
    status: "Confirmed",
  },
];

const activities = [
  {
    title: "Court 2 booked",
    detail: "Aarav Sharma · 10:00 AM",
    tone: "normal",
  },
  {
    title: "Court 4 blocked",
    detail: "Maintenance · 8:42 AM",
    tone: "warning",
  },
  {
    title: "Court 1 reopened",
    detail: "Inspection complete · 7:30 AM",
    tone: "success",
  },
];

function AmenityIcon({ amenity }: { amenity: string }) {
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

function getBookingDetails(value: string) {
  const [customer, time] = value.split(" · ");

  return {
    customer,
    time: time ?? "",
  };
}

export default function CourtsPage() {
  return (
    <main className="courts-page">
      <section className="courts-hero">
        <div className="hero-copy">
          <span className="eyebrow">COURT MANAGEMENT</span>

          <div className="hero-title-row">
            <div>
              <h1>Courts</h1>
              <p>Manage availability, pricing and daily operations.</p>
            </div>

            <a href="/partner/courts/add" className="add-court">
              <span aria-hidden="true">+</span>
              Add Court
            </a>
          </div>

          <label className="hero-search">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search courts..."
              aria-label="Search courts"
            />
          </label>

          <div className="filter-chips" aria-label="Court filters">
            <button type="button" className="active">
              All Courts
            </button>
            <button type="button">Indoor</button>
            <button type="button">Outdoor</button>
            <button type="button">Available</button>
            <button type="button">Maintenance</button>
          </div>

          <div className="hero-kpis">
            {kpis.map(([label, value]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
        </div>

        <aside className="hero-overview">
          <div className="occupancy-head">
            <div>
              <span>Today&apos;s occupancy</span>
              <strong>78%</strong>
            </div>
            <span className="trend">↑ 12%</span>
          </div>

          <div
            className="hero-progress"
            role="progressbar"
            aria-label="Today's court occupancy"
            aria-valuenow={78}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span />
          </div>

          <div className="hero-metrics">
            <article>
              <span>Revenue today</span>
              <strong>₹18,400</strong>
              <small>24 bookings</small>
            </article>

            <article>
              <span>Weather</span>
              <strong>27°C</strong>
              <small>Outdoor ready</small>
            </article>
          </div>

          <div className="hero-summary">
            <CheckCircle2 size={17} aria-hidden="true" />
            <div>
              <strong>Operations healthy</strong>
              <p>All five active courts are running on schedule.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="panel inventory-panel">
        <header className="section-header">
          <div>
            <span className="eyebrow">COURT INVENTORY</span>
            <h2>Live Courts</h2>
            <p>Current availability, bookings and daily performance.</p>
          </div>

          <button type="button" className="secondary-button">
            Sort by
            <ChevronDown size={15} aria-hidden="true" />
          </button>
        </header>

        <div className="court-grid">
          {courts.map((court) => {
            const booking = getBookingDetails(court.next);
            const isPlaying = court.next.includes("Playing now");
            const isMaintenance = court.status === "Maintenance";

            return (
              <article
                className={`court-card court-card-${court.status.toLowerCase()}`}
                key={court.id}
              >
                <div className="court-image">
                  <img
                    src={court.image}
                    alt={`${court.name} pickleball court`}
                  />

                  <div className="court-image-overlay" />

                  <div className="court-image-top">
                    <span className="court-number">{court.number}</span>

                    <span
                      className={`status-badge ${court.status.toLowerCase()}`}
                    >
                      <i aria-hidden="true" />
                      {court.status}
                    </span>
                  </div>
                </div>

                <div className="court-card-body">
                  <header className="court-identity">
                    <div>
                      <span>{court.type}</span>
                      <h3>{court.name}</h3>
                    </div>

                    <div className="court-price">
                      <span>Hourly rate</span>
                      <strong>{court.price}</strong>
                    </div>
                  </header>

                  <div className="court-meta">
                    <span>
                      <span className="meta-icon">
                        <Dumbbell size={14} aria-hidden="true" />
                      </span>
                      <span>
                        <small>Surface</small>
                        <strong>{court.surface}</strong>
                      </span>
                    </span>

                    <span>
                      <span className="meta-icon">
                        <UsersRound size={14} aria-hidden="true" />
                      </span>
                      <span>
                        <small>Capacity</small>
                        <strong>{court.capacity}</strong>
                      </span>
                    </span>
                  </div>

                  <div className="amenities">
                    {court.amenities.map((amenity) => (
                      <span key={amenity}>
                        <AmenityIcon amenity={amenity} />
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <section
                    className={`booking-widget ${
                      isPlaying
                        ? "is-playing"
                        : isMaintenance
                          ? "is-blocked"
                          : ""
                    }`}
                  >
                    <span className="booking-icon">
                      <CalendarClock size={16} aria-hidden="true" />
                    </span>

                    <div>
                      <small>
                        {isPlaying
                          ? "Playing now"
                          : isMaintenance
                            ? "Court unavailable"
                            : "Upcoming booking"}
                      </small>
                      <strong>{booking.customer}</strong>
                    </div>

                    {booking.time && (
                      <span className="booking-time">
                        <Clock3 size={13} aria-hidden="true" />
                        {booking.time}
                      </span>
                    )}
                  </section>

                  <div className="performance-strip">
                    <div className="revenue-metric">
                      <span className="metric-icon">
                        <IndianRupee size={16} aria-hidden="true" />
                      </span>
                      <span>
                        <small>Revenue today</small>
                        <strong>{court.revenue}</strong>
                      </span>
                    </div>

                    <div className="occupancy-metric">
                      <div>
                        <small>Occupancy</small>
                        <strong>{court.occupancy}%</strong>
                      </div>

                      <div
                        className="court-progress"
                        role="progressbar"
                        aria-label={`${court.name} occupancy`}
                        aria-valuenow={court.occupancy}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <span
                          className={`width-${court.occupancy}`}
                        />
                      </div>
                    </div>
                  </div>

                  <footer className="court-actions">
                    <button type="button">
                      <Pencil size={15} aria-hidden="true" />
                      Edit Court
                    </button>

                    <a href="/partner/bookings">
                      <CalendarClock size={15} aria-hidden="true" />
                      View Schedule
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  </footer>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel schedule-panel">
        <header className="section-header">
          <div>
            <span className="eyebrow">TODAY&apos;S OPERATIONS</span>
            <h2>Availability Schedule</h2>
            <p>Live availability across today&apos;s slots.</p>
          </div>

          <button type="button" className="secondary-button">
            Manage Schedule
          </button>
        </header>

        <div className="schedule-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Court</th>
                <th scope="col">8 AM</th>
                <th scope="col">9 AM</th>
                <th scope="col">10 AM</th>
                <th scope="col">11 AM</th>
                <th scope="col">12 PM</th>
                <th scope="col">1 PM</th>
              </tr>
            </thead>

            <tbody>
              {schedule.map((row) => (
                <tr key={row.court}>
                  <th scope="row">{row.court}</th>

                  {row.slots.map((slot, index) => (
                    <td key={`${row.court}-${index}`}>
                      <span className={slot}>{slot}</span>
                    </td>
                  ))}
                </tr>
              ))}
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

      <section className="analytics-grid">
        <article className="panel analytics-card revenue-card">
          <header>
            <div>
              <span className="eyebrow">ANALYTICS</span>
              <h2>Revenue Overview</h2>
            </div>

            <button type="button">
              This week
              <ChevronDown size={14} aria-hidden="true" />
            </button>
          </header>

          <div className="analytics-values">
            <div>
              <span>Total revenue</span>
              <strong>₹1,24,800</strong>
              <small>↑ 12.4% this week</small>
            </div>

            <div>
              <span>Average per court</span>
              <strong>₹20,800</strong>
            </div>
          </div>

          <div className="bar-chart" aria-label="Weekly revenue chart">
            <span className="bar-1" />
            <span className="bar-2" />
            <span className="bar-3" />
            <span className="bar-4" />
            <span className="bar-5" />
            <span className="bar-6" />
            <span className="bar-7" />
          </div>

          <div className="chart-labels">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </article>

        <article className="panel analytics-card occupancy-card">
          <header>
            <div>
              <span className="eyebrow">UTILIZATION</span>
              <h2>Occupancy</h2>
            </div>
            <strong>78%</strong>
          </header>

          <div className="occupancy-content">
            <div className="ring-chart">
              <div>
                <strong>78%</strong>
                <span>Average</span>
              </div>
            </div>

            <ul>
              <li>
                <span>Indoor courts</span>
                <strong>84%</strong>
              </li>
              <li>
                <span>Outdoor courts</span>
                <strong>71%</strong>
              </li>
              <li>
                <span>Peak hour</span>
                <strong>6–8 PM</strong>
              </li>
            </ul>
          </div>
        </article>
      </section>

      <section className="panel ranking-panel">
        <header className="section-header">
          <div>
            <span className="eyebrow">PERFORMANCE</span>
            <h2>Top Performing Courts</h2>
            <p>Revenue and utilization leaders this week.</p>
          </div>

          <span className="period-chip">This week</span>
        </header>

        <div className="ranking-list">
          {courts.slice(0, 3).map((court, index) => (
            <article key={court.id}>
              <span className="rank">0{index + 1}</span>

              <div className="ranking-name">
                <strong>{court.name}</strong>
                <small>{court.type}</small>
              </div>

              <div className="ranking-progress">
                <div>
                  <span>Occupancy</span>
                  <strong>{court.occupancy}%</strong>
                </div>

                <div>
                  <span className={`width-${court.occupancy}`} />
                </div>
              </div>

              <div className="ranking-revenue">
                <span>Revenue today</span>
                <strong>{court.revenue}</strong>
              </div>

              <span className="ranking-trend">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="bottom-grid">
        <article className="panel bookings-panel">
          <header className="section-header">
            <div>
              <span className="eyebrow">ACTIVITY</span>
              <h2>Recent Bookings</h2>
            </div>

            <a href="/partner/bookings">View All</a>
          </header>

          <div className="booking-list">
            {bookings.map((booking) => (
              <article key={booking.customer}>
                <span className="avatar">{booking.initials}</span>

                <div>
                  <strong>{booking.customer}</strong>
                  <small>{booking.court}</small>
                </div>

                <time>{booking.time}</time>

                <span
                  className={`booking-status ${booking.status.toLowerCase()}`}
                >
                  {booking.status}
                </span>

                <button type="button">View</button>
              </article>
            ))}
          </div>
        </article>

        <article className="panel operations-panel">
          <header className="section-header">
            <div>
              <span className="eyebrow">OPERATIONS</span>
              <h2>Today</h2>
            </div>

            <span className="live-status">
              <i />
              Live
            </span>
          </header>

          <div className="operations-summary">
            <article>
              <span>Bookings</span>
              <strong>24</strong>
            </article>
            <article>
              <span>Revenue</span>
              <strong>₹18.4K</strong>
            </article>
            <article>
              <span>Peak</span>
              <strong>6–8 PM</strong>
            </article>
          </div>

          <div className="activity-list">
            {activities.map((activity) => (
              <article className={activity.tone} key={activity.title}>
                <i />
                <div>
                  <strong>{activity.title}</strong>
                  <p>{activity.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="panel compact-panel">
          <header>
            <span className="eyebrow">TEAM</span>
            <h2>Staff on Duty</h2>
          </header>

          <div className="staff-list">
            <article>
              <span>AK</span>
              <div>
                <strong>Arjun Kumar</strong>
                <p>Venue Manager</p>
              </div>
              <i aria-label="Online" />
            </article>

            <article>
              <span>NP</span>
              <div>
                <strong>Neha Patel</strong>
                <p>Court Supervisor</p>
              </div>
              <i aria-label="Online" />
            </article>

            <article>
              <span>RS</span>
              <div>
                <strong>Ravi Singh</strong>
                <p>Maintenance</p>
              </div>
              <i aria-label="Online" />
            </article>
          </div>
        </article>
      </section>
    </main>
  );
}