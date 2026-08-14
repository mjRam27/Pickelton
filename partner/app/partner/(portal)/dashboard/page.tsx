import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  LayoutGrid,
  MapPin,
  Plus,
  Settings2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Wrench,
} from "lucide-react";
import "./page.css";

const quickActions = [
  {
    title: "New Booking",
    description: "Create a court reservation",
    href: "/partner/bookings/add",
    icon: CalendarCheck2,
  },
  {
    title: "Add Court",
    description: "Register a new court",
    href: "/partner/courts/add",
    icon: Plus,
  },
  {
    title: "View Schedule",
    description: "Review today’s bookings",
    href: "/partner/bookings",
    icon: CalendarDays,
  },
  {
    title: "Manage Availability",
    description: "Update court availability",
    href: "/partner/courts",
    icon: Settings2,
  },
];

const kpis = [
  {
    label: "Today’s Bookings",
    value: "24",
    detail: "+12% from yesterday",
    detailClass: "positive",
    icon: CalendarCheck2,
  },
  {
    label: "Today’s Revenue",
    value: "₹18,400",
    detail: "Today’s earnings",
    detailClass: "",
    icon: IndianRupee,
  },
  {
    label: "Court Occupancy",
    value: "92%",
    detail: "Peak-hour utilization",
    detailClass: "positive",
    icon: TrendingUp,
  },
  {
    label: "Active Courts",
    value: "8",
    detail: "All courts available",
    detailClass: "",
    icon: LayoutGrid,
  },
];

const revenueData = [
  { day: "Mon", value: 58 },
  { day: "Tue", value: 76 },
  { day: "Wed", value: 64 },
  { day: "Thu", value: 86 },
  { day: "Fri", value: 73 },
  { day: "Sat", value: 100 },
  { day: "Sun", value: 91 },
];

const bookingStatuses = [
  { label: "Confirmed", value: 14, className: "confirmed" },
  { label: "Pending", value: 4, className: "pending" },
  { label: "Completed", value: 5, className: "completed" },
  { label: "Cancelled", value: 1, className: "cancelled" },
];

const businessInsights = [
  {
    label: "Peak Booking Time",
    value: "6:00 – 8:00 PM",
    detail: "Highest demand window",
    icon: CalendarCheck2,
    tone: "",
  },
  {
    label: "Best Performing Court",
    value: "Court 1",
    detail: "96% occupancy",
    icon: Trophy,
    tone: "positive",
  },
  {
    label: "Lowest Utilization",
    value: "Court 3",
    detail: "73% occupancy",
    icon: TrendingDown,
    tone: "attention",
  },
  {
    label: "Monthly Growth",
    value: "+18.2%",
    detail: "Compared with last month",
    icon: TrendingUp,
    tone: "positive",
  },
];

const todaysSchedule = [
  {
    time: "10:00 AM",
    customer: "Rahul Sharma",
    initials: "RS",
    court: "Court 1",
    status: "Confirmed",
    statusClass: "confirmed",
    next: true,
  },
  {
    time: "10:30 AM",
    customer: "Priya Kumar",
    initials: "PK",
    court: "Court 3",
    status: "Pending",
    statusClass: "pending",
    next: false,
  },
  {
    time: "12:00 PM",
    customer: "Amit Singh",
    initials: "AS",
    court: "Court 5",
    status: "Completed",
    statusClass: "completed",
    next: false,
  },
];

const recentBookings = [
  {
    id: "BKG-1024",
    customer: "Rahul Sharma",
    initials: "RS",
    court: "Court 1",
    time: "10:00 AM",
    status: "Confirmed",
    statusClass: "confirmed",
  },
  {
    id: "BKG-1025",
    customer: "Priya Kumar",
    initials: "PK",
    court: "Court 3",
    time: "10:30 AM",
    status: "Pending",
    statusClass: "pending",
  },
  {
    id: "BKG-1026",
    customer: "Amit Singh",
    initials: "AS",
    court: "Court 5",
    time: "12:00 PM",
    status: "Completed",
    statusClass: "completed",
  },
];

const courtPerformance = [
  {
    name: "Court 1",
    occupancy: 96,
    revenue: "₹42,500",
    trend: "+12%",
    trendClass: "positive",
    availability: "Available",
    availabilityClass: "available",
  },
  {
    name: "Court 2",
    occupancy: 84,
    revenue: "₹34,800",
    trend: "+6%",
    trendClass: "positive",
    availability: "Available",
    availabilityClass: "available",
  },
  {
    name: "Court 3",
    occupancy: 73,
    revenue: "₹27,200",
    trend: "-3%",
    trendClass: "negative",
    availability: "Busy",
    availabilityClass: "busy",
  },
];

const notifications = [
  {
    title: "Booking approval required",
    description: "A new booking is waiting for confirmation.",
    time: "8 min ago",
    icon: CalendarCheck2,
    tone: "attention",
  },
  {
    title: "Payment received",
    description: "Payment for booking BKG-1024 was completed.",
    time: "24 min ago",
    icon: CreditCard,
    tone: "positive",
  },
  {
    title: "Court maintenance",
    description: "Court 3 maintenance is scheduled for tomorrow.",
    time: "1 hr ago",
    icon: Wrench,
    tone: "attention",
  },
  {
    title: "Availability updated",
    description: "Weekend availability was successfully updated.",
    time: "2 hrs ago",
    icon: CheckCircle2,
    tone: "positive",
  },
];

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <span className="dashboard-hero-orbit dashboard-hero-orbit-large" />
        <span className="dashboard-hero-orbit dashboard-hero-orbit-small" />

        <div className="dashboard-hero-main">
  <div className="dashboard-hero-copy">
    <span className="dashboard-eyebrow">
      TODAY'S OVERVIEW
    </span>

    <h1>Good Evening, Ms. Amrutha!</h1>

    <p>
      Here's everything happening across your business today.
    </p>
  </div>

          <Link
            href="/partner/bookings/add"
          
          >
            <Plus size={18} aria-hidden="true" />
          </Link>
        </div>

        <div className="dashboard-hero-kpis">
          <div className="dashboard-hero-kpi">
            <span>Today’s Bookings</span>
            <strong>24</strong>
          </div>

          <div className="dashboard-hero-kpi">
            <span>Occupancy</span>
            <strong>92%</strong>
          </div>

          <div className="dashboard-hero-kpi">
            <span>Revenue</span>
            <strong>₹18,400</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-quick-actions">
        <header className="dashboard-section-heading">
          <div>
            <span className="dashboard-section-label">SHORTCUTS</span>
            <h2>Quick Actions</h2>
          </div>
        </header>

        <div className="dashboard-quick-action-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                className="dashboard-quick-action"
                href={action.href}
                key={action.title}
              >
                <span className="dashboard-quick-action-icon">
                  <Icon size={19} aria-hidden="true" />
                </span>

                <span className="dashboard-quick-action-copy">
                  <strong>{action.title}</strong>
                  <small>{action.description}</small>
                </span>

                <ArrowRight
                  className="dashboard-quick-action-arrow"
                  size={17}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section
        className="dashboard-stats-grid"
        aria-label="Dashboard statistics"
      >
        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <article className="dashboard-stat-card" key={kpi.label}>
              <div className="dashboard-stat-header">
                <span>{kpi.label}</span>
                <span className="dashboard-stat-icon">
                  <Icon size={19} aria-hidden="true" />
                </span>
              </div>

              <strong className="dashboard-stat-value">{kpi.value}</strong>
              <p
                className={`dashboard-stat-detail ${kpi.detailClass}`}
              >
                {kpi.detail}
              </p>
            </article>
          );
        })}
      </section>

      <section className="dashboard-primary-grid">
        <article className="dashboard-card dashboard-revenue-card">
          <header className="dashboard-card-header">
            <div>
              <span className="dashboard-section-label">ANALYTICS</span>
              <h2>Revenue Overview</h2>
              <p>Daily revenue performance for this month.</p>
            </div>

            <span className="dashboard-period">This Month</span>
          </header>

          <div className="dashboard-revenue-metrics">
            <div>
              <span>Total Revenue</span>
              <strong>₹1,24,800</strong>
            </div>

            <div>
              <span>Average Booking Value</span>
              <strong>₹720</strong>
            </div>

            <div>
              <span>Monthly Growth</span>
              <strong className="dashboard-positive-text">+18.2%</strong>
            </div>
          </div>

          <div
            className="dashboard-revenue-chart"
            role="img"
            aria-label="Revenue performance from Monday through Sunday"
          >
            <div className="dashboard-chart-grid" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>

            {revenueData.map((item) => (
              <div className="dashboard-chart-column" key={item.day}>
                <div className="dashboard-chart-track">
                  <span
                    className="dashboard-chart-bar"
                    style={{ height: `${item.value}%` }}
                  />
                </div>
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card dashboard-status-card">
          <header className="dashboard-card-header">
            <div>
              <span className="dashboard-section-label">TODAY</span>
              <h2>Booking Status</h2>
              <p>Current distribution across 24 bookings.</p>
            </div>
          </header>

          <div
            className="dashboard-status-bar"
            aria-label="Booking status distribution"
          >
            <span className="confirmed" style={{ width: "58.33%" }} />
            <span className="pending" style={{ width: "16.67%" }} />
            <span className="completed" style={{ width: "20.83%" }} />
            <span className="cancelled" style={{ width: "4.17%" }} />
          </div>

          <div className="dashboard-status-list">
            {bookingStatuses.map((status) => (
              <div className="dashboard-status-row" key={status.label}>
                <span
                  className={`dashboard-status-dot ${status.className}`}
                />
                <span>{status.label}</span>
                <strong>{status.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-secondary-grid">
        <article className="dashboard-card">
          <header className="dashboard-card-header">
            <div>
              <span className="dashboard-section-label">
                BUSINESS HEALTH
              </span>
              <h2>Business Insights</h2>
              <p>Actionable indicators from current venue activity.</p>
            </div>
          </header>

          <div className="dashboard-insights-grid">
            {businessInsights.map((insight) => {
              const Icon = insight.icon;

              return (
                <div className="dashboard-insight" key={insight.label}>
                  <span
                    className={`dashboard-insight-icon ${insight.tone}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>

                  <div>
                    <span>{insight.label}</span>
                    <strong>{insight.value}</strong>
                    <small>{insight.detail}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="dashboard-card">
          <header className="dashboard-card-header">
            <div>
              <span className="dashboard-section-label">OPERATIONS</span>
              <h2>Today’s Schedule</h2>
              <p>Upcoming court activity for today.</p>
            </div>

            <Link href="/partner/bookings" className="dashboard-text-action">
              Full schedule
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </header>

          <div className="dashboard-schedule-list">
            {todaysSchedule.map((booking) => (
              <div
                className={`dashboard-schedule-item ${
                  booking.next ? "is-next" : ""
                }`}
                key={`${booking.customer}-${booking.time}`}
              >
                <time>{booking.time}</time>
                <span className="dashboard-avatar">
                  {booking.initials}
                </span>

                <div className="dashboard-schedule-copy">
                  <strong>{booking.customer}</strong>
                  <span>
                    <MapPin size={12} aria-hidden="true" />
                    {booking.court}
                  </span>
                </div>

                <span
                  className={`dashboard-status-chip ${booking.statusClass}`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <article className="dashboard-card dashboard-bookings-card">
          <header className="dashboard-card-header">
            <div>
              <span className="dashboard-section-label">ACTIVITY</span>
              <h2>Recent Bookings</h2>
              <p>Latest court reservations for today.</p>
            </div>

            <Link href="/partner/bookings" className="dashboard-outline-action">
              View All
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </header>

          <div className="dashboard-table-wrapper">
            <table className="dashboard-booking-table">
              <thead>
                <tr>
                  <th scope="col">Booking ID</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Court</th>
                  <th scope="col">Time</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="dashboard-action-heading">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <span className="dashboard-booking-id">
                        {booking.id}
                      </span>
                    </td>

                    <td>
                      <div className="dashboard-customer-cell">
                        <span className="dashboard-avatar">
                          {booking.initials}
                        </span>
                        <strong>{booking.customer}</strong>
                      </div>
                    </td>

                    <td>{booking.court}</td>
                    <td>{booking.time}</td>

                    <td>
                      <span
                        className={`dashboard-status-chip ${booking.statusClass}`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td className="dashboard-action-cell">
                      <Link
                        href={`/partner/bookings/${booking.id}`}
                        className="dashboard-table-action"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dashboard-card">
          <header className="dashboard-card-header">
            <div>
              <span className="dashboard-section-label">UTILIZATION</span>
              <h2>Court Performance</h2>
              <p>Occupancy and revenue contribution.</p>
            </div>
          </header>

          <div className="dashboard-court-list">
            {courtPerformance.map((court) => (
              <div className="dashboard-court-item" key={court.name}>
                <div className="dashboard-court-heading">
                  <div>
                    <strong>{court.name}</strong>
                    <span>{court.revenue} revenue</span>
                  </div>

                  <span
                    className={`dashboard-availability ${court.availabilityClass}`}
                  >
                    {court.availability}
                  </span>
                </div>

                <div className="dashboard-court-progress-heading">
                  <span>Occupancy</span>

                  <div>
                    <strong>{court.occupancy}%</strong>
                    <span
                      className={`dashboard-trend ${court.trendClass}`}
                    >
                      {court.trend}
                    </span>
                  </div>
                </div>

                <div
                  className="dashboard-progress"
                  role="progressbar"
                  aria-label={`${court.name} occupancy`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={court.occupancy}
                >
                  <span style={{ width: `${court.occupancy}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-card dashboard-notifications-card">
        <header className="dashboard-card-header">
          <div>
            <span className="dashboard-section-label">UPDATES</span>
            <h2>Notifications</h2>
            <p>Important booking and venue updates.</p>
          </div>

          <button
            className="dashboard-icon-action"
            type="button"
            aria-label="Notification options"
          >
            <Bell size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="dashboard-notification-grid">
          {notifications.map((notification) => {
            const Icon = notification.icon;

            return (
              <article
                className="dashboard-notification"
                key={notification.title}
              >
                <span
                  className={`dashboard-notification-icon ${notification.tone}`}
                >
                  <Icon size={18} aria-hidden="true" />
                </span>

                <div>
                  <strong>{notification.title}</strong>
                  <p>{notification.description}</p>
                  <time>{notification.time}</time>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}