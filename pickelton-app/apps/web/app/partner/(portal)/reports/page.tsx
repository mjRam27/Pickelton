"use client";

import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import "./page.css";

type DatePreset = "today" | "7d" | "30d" | "year" | "custom";
type Granularity = "daily" | "weekly" | "monthly" | "yearly";
type Breakdown = "court" | "period" | "payment";
type ReportStatus = "Ready" | "Processing" | "Failed";

interface RevenuePoint {
  label: string;
  value: number;
  previous: number;
  height: number;
  previousHeight: number;
}

interface CourtPerformance {
  name: string;
  utilization: number;
  revenue: number;
  bookings: number;
  trend: number;
}

interface CustomerInsight {
  name: string;
  bookings: number;
  revenue: number;
  preferredCourt: string;
}

interface ReportHistoryItem {
  id: string;
  name: string;
  generatedDate: string;
  type: string;
  period: string;
  status: ReportStatus;
  format: "CSV" | "PDF" | "Excel";
}

interface BreakdownItem {
  label: string;
  value: number;
  color: string;
}

const revenueSeries: Record<Granularity, RevenuePoint[]> = {
  daily: [
    {
      label: "Mon",
      value: 48000,
      previous: 39000,
      height: 76,
      previousHeight: 61,
    },
    {
      label: "Tue",
      value: 62000,
      previous: 54000,
      height: 99,
      previousHeight: 86,
    },
    {
      label: "Wed",
      value: 71000,
      previous: 65000,
      height: 113,
      previousHeight: 104,
    },
    {
      label: "Thu",
      value: 84000,
      previous: 70000,
      height: 134,
      previousHeight: 112,
    },
    {
      label: "Fri",
      value: 93000,
      previous: 79000,
      height: 149,
      previousHeight: 126,
    },
    {
      label: "Sat",
      value: 106000,
      previous: 91000,
      height: 170,
      previousHeight: 146,
    },
    {
      label: "Sun",
      value: 98000,
      previous: 86000,
      height: 157,
      previousHeight: 138,
    },
  ],
  weekly: [
    {
      label: "Week 1",
      value: 92000,
      previous: 81000,
      height: 96,
      previousHeight: 84,
    },
    {
      label: "Week 2",
      value: 111000,
      previous: 97000,
      height: 116,
      previousHeight: 101,
    },
    {
      label: "Week 3",
      value: 129000,
      previous: 108000,
      height: 135,
      previousHeight: 113,
    },
    {
      label: "Week 4",
      value: 150000,
      previous: 126000,
      height: 157,
      previousHeight: 132,
    },
  ],
  monthly: [
    {
      label: "Jan",
      value: 320000,
      previous: 284000,
      height: 105,
      previousHeight: 93,
    },
    {
      label: "Feb",
      value: 356000,
      previous: 311000,
      height: 117,
      previousHeight: 102,
    },
    {
      label: "Mar",
      value: 382000,
      previous: 334000,
      height: 125,
      previousHeight: 109,
    },
    {
      label: "Apr",
      value: 416000,
      previous: 362000,
      height: 136,
      previousHeight: 118,
    },
    {
      label: "May",
      value: 451000,
      previous: 394000,
      height: 148,
      previousHeight: 129,
    },
    {
      label: "Jun",
      value: 468000,
      previous: 421000,
      height: 153,
      previousHeight: 138,
    },
    {
      label: "Jul",
      value: 482000,
      previous: 445000,
      height: 158,
      previousHeight: 146,
    },
  ],
  yearly: [
    {
      label: "2022",
      value: 3100000,
      previous: 2720000,
      height: 102,
      previousHeight: 89,
    },
    {
      label: "2023",
      value: 3780000,
      previous: 3100000,
      height: 124,
      previousHeight: 102,
    },
    {
      label: "2024",
      value: 4420000,
      previous: 3780000,
      height: 145,
      previousHeight: 124,
    },
    {
      label: "2025",
      value: 5180000,
      previous: 4420000,
      height: 170,
      previousHeight: 145,
    },
  ],
};

const bookingHours = [
  { label: "6–9 AM", value: 48 },
  { label: "9–12 PM", value: 76 },
  { label: "12–4 PM", value: 58 },
  { label: "4–8 PM", value: 92 },
  { label: "8–10 PM", value: 64 },
];

const bookingStatuses = [
  { label: "Confirmed", value: 68, className: "confirmed" },
  { label: "Pending", value: 14, className: "pending" },
  { label: "Completed", value: 12, className: "completed" },
  { label: "Cancelled", value: 6, className: "cancelled" },
];

const courtPerformance: CourtPerformance[] = [
  {
    name: "Centre Court",
    utilization: 96,
    revenue: 142600,
    bookings: 362,
    trend: 12,
  },
  {
    name: "Court 1",
    utilization: 88,
    revenue: 121400,
    bookings: 318,
    trend: 8,
  },
  {
    name: "Court 2",
    utilization: 81,
    revenue: 108200,
    bookings: 294,
    trend: 4,
  },
  {
    name: "Court 3",
    utilization: 67,
    revenue: 74600,
    bookings: 210,
    trend: -3,
  },
];

const customerInsights: CustomerInsight[] = [
  {
    name: "Aarav Sharma",
    bookings: 18,
    revenue: 21600,
    preferredCourt: "Centre Court",
  },
  {
    name: "Meera Kapoor",
    bookings: 15,
    revenue: 16200,
    preferredCourt: "Court 2",
  },
  {
    name: "Rohan Verma",
    bookings: 13,
    revenue: 14300,
    preferredCourt: "Court 1",
  },
];

const breakdownData: Record<Breakdown, BreakdownItem[]> = {
  court: [
    { label: "Centre Court", value: 30, color: "#0C4A38" },
    { label: "Court 1", value: 25, color: "#C8F550" },
    { label: "Court 2", value: 23, color: "#8AAE75" },
    { label: "Court 3", value: 22, color: "#DDE7DF" },
  ],
  period: [
    { label: "Morning", value: 28, color: "#0C4A38" },
    { label: "Afternoon", value: 24, color: "#C8F550" },
    { label: "Evening", value: 38, color: "#8AAE75" },
    { label: "Late Evening", value: 10, color: "#DDE7DF" },
  ],
  payment: [
    { label: "UPI", value: 46, color: "#0C4A38" },
    { label: "Cards", value: 31, color: "#C8F550" },
    { label: "Cash", value: 15, color: "#8AAE75" },
    { label: "Wallet", value: 8, color: "#DDE7DF" },
  ],
};

const reportHistory: ReportHistoryItem[] = [
  {
    id: "RPT-2048",
    name: "Monthly Performance",
    generatedDate: "20 Jul 2026",
    type: "Business Summary",
    period: "01–20 Jul 2026",
    status: "Ready",
    format: "CSV",
  },
  {
    id: "RPT-2047",
    name: "Court Utilization",
    generatedDate: "15 Jul 2026",
    type: "Court Analytics",
    period: "01–15 Jul 2026",
    status: "Ready",
    format: "CSV",
  },
  {
    id: "RPT-2046",
    name: "Customer Growth",
    generatedDate: "10 Jul 2026",
    type: "Customer Analytics",
    period: "Jun 2026",
    status: "Processing",
    format: "PDF",
  },
  {
    id: "RPT-2045",
    name: "Revenue Breakdown",
    generatedDate: "01 Jul 2026",
    type: "Revenue",
    period: "Jun 2026",
    status: "Ready",
    format: "CSV",
  },
  {
    id: "RPT-2044",
    name: "Annual Performance",
    generatedDate: "30 Jun 2026",
    type: "Business Summary",
    period: "2025–2026",
    status: "Failed",
    format: "Excel",
  },
];

const REPORTS_PER_PAGE = 3;

function toDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 10);
}

function getPresetDates(preset: DatePreset) {
  const end = new Date();
  const start = new Date(end);

  if (preset === "7d") {
    start.setDate(end.getDate() - 6);
  } else if (preset === "30d") {
    start.setDate(end.getDate() - 29);
  } else if (preset === "year") {
    start.setMonth(0, 1);
  }

  return {
    start: toDateInputValue(start),
    end: toDateInputValue(end),
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeCsv(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function KpiCard({
  label,
  value,
  detail,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  trend: number;
  icon: LucideIcon;
}) {
  const positive = trend >= 0;

  return (
    <article className="stat-card">
      <div className="stat-card-header">
        <span>{label}</span>
        <span className="stat-icon">
          <Icon size={20} aria-hidden="true" />
        </span>
      </div>

      <h2>{value}</h2>

      <div className="stat-comparison">
        <span className={positive ? "positive" : "negative"}>
          {positive ? (
            <ArrowUp size={12} aria-hidden="true" />
          ) : (
            <ArrowDown size={12} aria-hidden="true" />
          )}
          {Math.abs(trend)}%
        </span>
        <p>{detail}</p>
      </div>
    </article>
  );
}

function ReportsSkeleton() {
  return (
    <div className="reports-loading" aria-label="Loading reports">
      <div className="loading-kpis">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="loading-panels">
        <span />
        <span />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const defaultDates = getPresetDates("30d");

  const [datePreset, setDatePreset] = useState<DatePreset>("30d");
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [comparison, setComparison] = useState("previous-period");
  const [granularity, setGranularity] =
    useState<Granularity>("monthly");
  const [breakdown, setBreakdown] = useState<Breakdown>("court");
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  // Static data is available synchronously. This seam can later use the
  // application's real loading state without changing the page structure.
  const isLoading = false;

  const currentRevenueSeries = revenueSeries[granularity];
  const currentBreakdown = breakdownData[breakdown];

  const donutBackground = useMemo(() => {
    let total = 0;

    return `conic-gradient(${currentBreakdown
      .map((item) => {
        const start = total;
        total += item.value;
        return `${item.color} ${start}% ${total}%`;
      })
      .join(", ")})`;
  }, [currentBreakdown]);

  const totalReportPages = Math.max(
    1,
    Math.ceil(reportHistory.length / REPORTS_PER_PAGE),
  );
  const safeHistoryPage = Math.min(historyPage, totalReportPages);
  const reportStart = (safeHistoryPage - 1) * REPORTS_PER_PAGE;
  const paginatedReports = reportHistory.slice(
    reportStart,
    reportStart + REPORTS_PER_PAGE,
  );

  function applyPreset(preset: Exclude<DatePreset, "custom">) {
    const dates = getPresetDates(preset);

    setDatePreset(preset);
    setStartDate(dates.start);
    setEndDate(dates.end);
  }

  function updateCustomDate(
    setter: (value: string) => void,
    value: string,
  ) {
    setDatePreset("custom");
    setter(value);
  }

  function downloadCsv(
    filename: string,
    rows: Array<Array<string | number>>,
  ) {
    const csv = rows
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  function exportCurrentReport() {
    const rows: Array<Array<string | number>> = [
      ["Pickelton Partner Report"],
      ["Date From", startDate],
      ["Date To", endDate],
      ["Comparison", comparison],
      [],
      ["Metric", "Value"],
      ["Total Revenue", 482000],
      ["Total Bookings", 1284],
      ["Active Customers", 542],
      ["Occupancy", "91%"],
      [],
      ["Court", "Utilization", "Revenue", "Bookings", "Trend"],
      ...courtPerformance.map((court) => [
        court.name,
        `${court.utilization}%`,
        court.revenue,
        court.bookings,
        `${court.trend}%`,
      ]),
    ];

    downloadCsv("pickelton-business-report.csv", rows);
    setShowExportPanel(false);
  }

  function downloadHistoryReport(report: ReportHistoryItem) {
    if (report.status !== "Ready" || report.format !== "CSV") {
      return;
    }

    downloadCsv(`${report.id.toLowerCase()}.csv`, [
      ["Report ID", report.id],
      ["Report Name", report.name],
      ["Generated Date", report.generatedDate],
      ["Type", report.type],
      ["Period", report.period],
      ["Status", report.status],
    ]);
  }

  if (isLoading) {
    return (
      <main className="reports-page">
        <ReportsSkeleton />
      </main>
    );
  }

  return (
    <main className="reports-page">
      <section className="reports-hero">
        <div className="hero-decoration hero-decoration-large" />
        <div className="hero-decoration hero-decoration-small" />

        <div className="hero-main">
          <div>
            <span className="page-eyebrow">REPORTS</span>
            <h1>Business Performance</h1>
            <p>
              Monitor revenue, bookings, customers and court performance.
            </p>
          </div>

          <div className="hero-actions">
            <label>
              <span>Date From</span>
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(event) =>
                  updateCustomDate(setStartDate, event.target.value)
                }
              />
            </label>

            <label>
              <span>Date To</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) =>
                  updateCustomDate(setEndDate, event.target.value)
                }
              />
            </label>

            <div className="export-control">
              <button
                type="button"
                className="primary-btn"
                onClick={() =>
                  setShowExportPanel((current) => !current)
                }
                aria-expanded={showExportPanel}
              >
                <Download size={18} aria-hidden="true" />
                Export Report
              </button>

              {showExportPanel && (
                <div className="export-panel">
                  <div className="export-panel-header">
                    <div>
                      <strong>Export Report</strong>
                      <span>{startDate} – {endDate}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowExportPanel(false)}
                      aria-label="Close export panel"
                    >
                      <X size={17} aria-hidden="true" />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="export-option"
                    onClick={exportCurrentReport}
                  >
                    <FileSpreadsheet size={19} aria-hidden="true" />
                    <span>
                      <strong>CSV Report</strong>
                      <small>Available now</small>
                    </span>
                    <CheckCircle2 size={16} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="export-option"
                    disabled
                  >
                    <FileText size={19} aria-hidden="true" />
                    <span>
                      <strong>PDF Report</strong>
                      <small>Unavailable</small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="export-option"
                    disabled
                  >
                    <FileSpreadsheet size={19} aria-hidden="true" />
                    <span>
                      <strong>Excel Report</strong>
                      <small>Unavailable</small>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hero-bottom">
          <div className="date-presets">
            {[
              ["today", "Today"],
              ["7d", "Last 7 Days"],
              ["30d", "Last 30 Days"],
              ["year", "This Year"],
            ].map(([value, label]) => (
              <button
                type="button"
                className={datePreset === value ? "active" : undefined}
                onClick={() =>
                  applyPreset(
                    value as Exclude<DatePreset, "custom">,
                  )
                }
                key={value}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="comparison-control">
            <span>Compare with</span>
            <select
              value={comparison}
              onChange={(event) => setComparison(event.target.value)}
            >
              <option value="previous-period">Previous period</option>
              <option value="previous-month">Previous month</option>
              <option value="previous-year">Previous year</option>
            </select>
          </label>

          <div className="hero-kpis">
            <div>
              <span>Revenue</span>
              <strong>₹4.82L</strong>
            </div>
            <div>
              <span>Growth</span>
              <strong>+18.2%</strong>
            </div>
            <div>
              <span>Occupancy</span>
              <strong>91%</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <KpiCard
          label="Total Revenue"
          value="₹4,82,000"
          detail="versus previous period"
          trend={18.2}
          icon={IndianRupee}
        />
        <KpiCard
          label="Total Bookings"
          value="1,284"
          detail="versus previous period"
          trend={8}
          icon={CalendarDays}
        />
        <KpiCard
          label="Active Customers"
          value="542"
          detail="versus previous period"
          trend={12}
          icon={Users}
        />
        <KpiCard
          label="Occupancy Rate"
          value="91%"
          detail="versus previous period"
          trend={4}
          icon={BarChart3}
        />
      </section>

      <section className="analytics-grid primary-analytics">
        <article className="report-card revenue-card">
          <header className="card-header">
            <div>
              <span className="page-eyebrow">REVENUE</span>
              <h2>Revenue Analytics</h2>
              <p>Current and comparison-period performance</p>
            </div>

            <div className="granularity-control">
              {(["daily", "weekly", "monthly", "yearly"] as const).map(
                (value) => (
                  <button
                    type="button"
                    className={
                      granularity === value ? "active" : undefined
                    }
                    onClick={() => setGranularity(value)}
                    key={value}
                  >
                    {value}
                  </button>
                ),
              )}
            </div>
          </header>

          <div className="revenue-summary">
            <div>
              <span>Total Revenue</span>
              <strong>₹4,82,000</strong>
            </div>
            <div>
              <span>Average Booking Value</span>
              <strong>₹375</strong>
            </div>
            <div>
              <span>Growth</span>
              <strong className="positive">+18.2%</strong>
            </div>
          </div>

          <div className="chart-legend">
            <span><i className="current" />Current period</span>
            <span><i className="previous" />Comparison period</span>
          </div>

          <div
            className="chart"
            role="img"
            aria-label={`${granularity} revenue chart`}
          >
            <div className="chart-grid-lines" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>

            {currentRevenueSeries.map((point) => (
              <div className="chart-column" key={point.label}>
                <div className="chart-bars">
                  <span
                    className="bar previous-bar"
                    style={{ height: point.previousHeight }}
                    title={`Previous: ${formatCurrency(point.previous)}`}
                  />
                  <span
                    className="bar current-bar"
                    style={{ height: point.height }}
                    title={`Current: ${formatCurrency(point.value)}`}
                  />
                </div>
                <span>{point.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="report-card booking-analytics">
          <header className="card-header">
            <div>
              <span className="page-eyebrow">BOOKINGS</span>
              <h2>Booking Analytics</h2>
              <p>Peak periods and status distribution</p>
            </div>
          </header>

          <div className="booking-highlight">
            <span className="highlight-icon">
              <Clock3 size={20} aria-hidden="true" />
            </span>
            <div>
              <span>Peak Booking Hours</span>
              <strong>4:00 PM – 8:00 PM</strong>
              <small>92% of peak capacity</small>
            </div>
          </div>

          <div className="booking-hour-list">
            {bookingHours.map((item) => (
              <div key={item.label}>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="status-distribution">
            <div className="status-bar">
              {bookingStatuses.map((status) => (
                <span
                  className={status.className}
                  style={{ width: `${status.value}%` }}
                  key={status.label}
                />
              ))}
            </div>

            <div className="status-legend">
              {bookingStatuses.map((status) => (
                <div key={status.label}>
                  <span className={status.className} />
                  <small>{status.label}</small>
                  <strong>{status.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="report-card">
          <header className="card-header">
            <div>
              <span className="page-eyebrow">COURTS</span>
              <h2>Court Performance</h2>
              <p>Utilization and revenue contribution</p>
            </div>
          </header>

          <div className="court-performance-list">
            {courtPerformance.map((court, index) => (
              <div className="court-performance-row" key={court.name}>
                <span className="court-rank">{index + 1}</span>

                <div className="court-performance-main">
                  <div>
                    <strong>{court.name}</strong>
                    <span>{court.bookings} bookings</span>
                  </div>

                  <div className="progress-track">
                    <span style={{ width: `${court.utilization}%` }} />
                  </div>
                </div>

                <div className="court-performance-value">
                  <strong>{court.utilization}%</strong>
                  <span>{formatCurrency(court.revenue)}</span>
                </div>

                <span
                  className={
                    court.trend >= 0 ? "trend positive" : "trend negative"
                  }
                >
                  {court.trend >= 0 ? (
                    <TrendingUp size={13} aria-hidden="true" />
                  ) : (
                    <TrendingDown size={13} aria-hidden="true" />
                  )}
                  {Math.abs(court.trend)}%
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="report-card">
          <header className="card-header">
            <div>
              <span className="page-eyebrow">CUSTOMERS</span>
              <h2>Customer Insights</h2>
              <p>Growth, retention and leading customers</p>
            </div>
          </header>

          <div className="customer-metrics">
            <div>
              <span>New Customers</span>
              <strong>86</strong>
              <small className="positive">+14%</small>
            </div>
            <div>
              <span>Returning</span>
              <strong>456</strong>
              <small>84% of active customers</small>
            </div>
            <div>
              <span>Repeat Rate</span>
              <strong>72%</strong>
              <small className="positive">+6%</small>
            </div>
          </div>

          <div className="top-customers">
            <h3>Top Customers</h3>

            {customerInsights.map((customer) => (
              <div className="customer-row" key={customer.name}>
                <span className="customer-avatar">
                  {customer.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>

                <div>
                  <strong>{customer.name}</strong>
                  <span>
                    {customer.bookings} bookings · {customer.preferredCourt}
                  </span>
                </div>

                <strong>{formatCurrency(customer.revenue)}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="report-card">
          <header className="card-header">
            <div>
              <span className="page-eyebrow">BREAKDOWN</span>
              <h2>Revenue Contribution</h2>
              <p>Understand where revenue is generated</p>
            </div>

            <select
              className="breakdown-selector"
              value={breakdown}
              onChange={(event) =>
                setBreakdown(event.target.value as Breakdown)
              }
            >
              <option value="court">By Court</option>
              <option value="period">By Period</option>
              <option value="payment">By Payment</option>
            </select>
          </header>

          <div className="breakdown-content">
            <div
              className="donut-chart"
              style={{ background: donutBackground }}
              role="img"
              aria-label="Revenue contribution chart"
            >
              <div>
                <strong>₹4.82L</strong>
                <span>Total</span>
              </div>
            </div>

            <div className="breakdown-legend">
              {currentBreakdown.map((item) => (
                <div key={item.label}>
                  <span style={{ backgroundColor: item.color }} />
                  <small>{item.label}</small>
                  <strong>{item.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="report-card">
          <header className="card-header">
            <div>
              <span className="page-eyebrow">INSIGHTS</span>
              <h2>Operational Insights</h2>
              <p>Concise, actionable business signals</p>
            </div>
          </header>

          <div className="insights-grid">
            <div className="insight-card">
              <span className="insight-icon">
                <IndianRupee size={19} aria-hidden="true" />
              </span>
              <div>
                <span>Highest-Earning Court</span>
                <strong>Centre Court</strong>
                <small>₹1,42,600 this period</small>
              </div>
            </div>

            <div className="insight-card attention">
              <span className="insight-icon">
                <TrendingDown size={19} aria-hidden="true" />
              </span>
              <div>
                <span>Lowest Utilization</span>
                <strong>Court 3</strong>
                <small>67% utilization</small>
              </div>
            </div>

            <div className="insight-card">
              <span className="insight-icon">
                <CalendarDays size={19} aria-hidden="true" />
              </span>
              <div>
                <span>Peak Booking Day</span>
                <strong>Saturday</strong>
                <small>286 bookings</small>
              </div>
            </div>

            <div className="insight-card">
              <span className="insight-icon">
                <BarChart3 size={19} aria-hidden="true" />
              </span>
              <div>
                <span>Average Booking Value</span>
                <strong>₹375</strong>
                <small>+9% from previous period</small>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="report-card report-history">
        <header className="card-header">
          <div>
            <span className="page-eyebrow">HISTORY</span>
            <h2>Report History</h2>
            <p>Previously generated business reports</p>
          </div>
        </header>

        {reportHistory.length === 0 ? (
          <div className="reports-empty-state">
            <span>
              <FileText size={25} aria-hidden="true" />
            </span>
            <h3>No reports generated yet</h3>
            <p>Export your first report to create a report history.</p>
          </div>
        ) : (
          <>
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th scope="col">Report</th>
                    <th scope="col">Generated</th>
                    <th scope="col">Type</th>
                    <th scope="col">Period</th>
                    <th scope="col">Status</th>
                    <th scope="col">Format</th>
                    <th scope="col" className="history-action-heading">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedReports.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <span className="report-id">{report.id}</span>
                        <strong>{report.name}</strong>
                      </td>
                      <td>{report.generatedDate}</td>
                      <td>{report.type}</td>
                      <td>{report.period}</td>
                      <td>
                        <span
                          className={`report-status ${report.status.toLowerCase()}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td>{report.format}</td>
                      <td className="history-action-cell">
                        <button
                          type="button"
                          className="download-action"
                          onClick={() => downloadHistoryReport(report)}
                          disabled={
                            report.status !== "Ready" ||
                            report.format !== "CSV"
                          }
                        >
                          <Download size={14} aria-hidden="true" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="pagination">
              <p>
                Showing {reportStart + 1}–
                {Math.min(
                  reportStart + REPORTS_PER_PAGE,
                  reportHistory.length,
                )}{" "}
                of {reportHistory.length}
              </p>

              <div className="pagination-controls">
                <button
                  type="button"
                  onClick={() =>
                    setHistoryPage((current) =>
                      Math.max(1, current - 1),
                    )
                  }
                  disabled={safeHistoryPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} aria-hidden="true" />
                </button>

                {Array.from({ length: totalReportPages }).map(
                  (_, index) => {
                    const page = index + 1;

                    return (
                      <button
                        type="button"
                        className={
                          page === safeHistoryPage ? "active" : undefined
                        }
                        onClick={() => setHistoryPage(page)}
                        aria-current={
                          page === safeHistoryPage ? "page" : undefined
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
                    setHistoryPage((current) =>
                      Math.min(totalReportPages, current + 1),
                    )
                  }
                  disabled={safeHistoryPage === totalReportPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </main>
  );
}