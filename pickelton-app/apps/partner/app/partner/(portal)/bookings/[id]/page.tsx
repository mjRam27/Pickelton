// apps/web/app/partner/(portal)/bookings/[id]/page.tsx

import Link from "next/link";
import "./page.css";

interface BookingDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const booking = {
  status: "Confirmed",
  customer: {
    name: "Aarav Sharma",
    initials: "AS",
    phone: "+91 98765 43210",
    email: "aarav.sharma@example.com",
  },
  court: {
    name: "Centre Court",
    type: "Indoor",
    surface: "Premium Acrylic",
  },
  schedule: {
    date: "22 July 2026",
    timeSlot: "9:00 AM – 10:00 AM",
    duration: "1 hour",
    price: "₹1,200",
  },
  payment: {
    status: "Paid",
    method: "UPI",
  },
  notes:
    "Please keep two rental paddles ready. We may arrive approximately 10 minutes before the booking.",
};

export default async function BookingDetailsPage({
  params,
}: BookingDetailsPageProps) {
  const { id } = await params;
  const bookingId = decodeURIComponent(id);

  return (
    <main className="booking-details-page">
      <header className="booking-details-header">
        <div className="booking-header-content">
          <Link href="/partner/bookings" className="booking-back-btn">
            <span aria-hidden="true">←</span>
            Back
          </Link>

          <div>
            <span className="booking-page-tag">BOOKING</span>
            <h1>Booking Details</h1>
            <p>
              Booking ID: <strong>{bookingId}</strong>
            </p>
          </div>
        </div>

        <span className="booking-status-badge confirmed">
          {booking.status}
        </span>
      </header>

      <div className="booking-details-grid">
        <section className="booking-details-card">
          <header className="booking-section-header">
            <span className="booking-section-tag">CUSTOMER</span>
            <h2>Customer Information</h2>
          </header>

          <div className="booking-customer-profile">
            <div className="booking-avatar" aria-hidden="true">
              {booking.customer.initials}
            </div>

            <div>
              <h3>{booking.customer.name}</h3>
              <p>Pickelton customer</p>
            </div>
          </div>

          <dl className="booking-info-list">
            <div className="booking-info-row">
              <dt>Phone Number</dt>
              <dd>{booking.customer.phone}</dd>
            </div>

            <div className="booking-info-row">
              <dt>Email Address</dt>
              <dd>{booking.customer.email}</dd>
            </div>
          </dl>
        </section>

        <section className="booking-details-card">
          <header className="booking-section-header">
            <span className="booking-section-tag">COURT</span>
            <h2>Court Information</h2>
          </header>

          <dl className="booking-info-list">
            <div className="booking-info-row">
              <dt>Court Name</dt>
              <dd>{booking.court.name}</dd>
            </div>

            <div className="booking-info-row">
              <dt>Court Type</dt>
              <dd>{booking.court.type}</dd>
            </div>

            <div className="booking-info-row">
              <dt>Surface</dt>
              <dd>{booking.court.surface}</dd>
            </div>
          </dl>
        </section>

        <section className="booking-details-card booking-schedule-card">
          <header className="booking-section-header">
            <span className="booking-section-tag">SCHEDULE</span>
            <h2>Booking Information</h2>
          </header>

          <dl className="booking-summary-grid">
            <div className="booking-summary-item">
              <dt>Booking Date</dt>
              <dd>{booking.schedule.date}</dd>
            </div>

            <div className="booking-summary-item">
              <dt>Time Slot</dt>
              <dd>{booking.schedule.timeSlot}</dd>
            </div>

            <div className="booking-summary-item">
              <dt>Duration</dt>
              <dd>{booking.schedule.duration}</dd>
            </div>

            <div className="booking-summary-item booking-price">
              <dt>Price</dt>
              <dd>{booking.schedule.price}</dd>
            </div>
          </dl>
        </section>

        <section className="booking-details-card">
          <header className="booking-section-header">
            <span className="booking-section-tag">PAYMENT</span>
            <h2>Payment Information</h2>
          </header>

          <dl className="booking-info-list">
            <div className="booking-info-row">
              <dt>Payment Status</dt>
              <dd>
                <span className="booking-payment-status">
                  {booking.payment.status}
                </span>
              </dd>
            </div>

            <div className="booking-info-row">
              <dt>Payment Method</dt>
              <dd>{booking.payment.method}</dd>
            </div>
          </dl>
        </section>

        <section className="booking-details-card booking-notes-card">
          <header className="booking-section-header">
            <span className="booking-section-tag">NOTES</span>
            <h2>Customer Notes</h2>
          </header>

          <p className="booking-notes">{booking.notes}</p>
        </section>
      </div>

      <footer className="booking-bottom-actions">
        <button type="button" className="booking-cancel-btn">
          Cancel Booking
        </button>

        <button type="button" className="booking-primary-btn">
          Edit Booking
        </button>
      </footer>
    </main>
  );
}