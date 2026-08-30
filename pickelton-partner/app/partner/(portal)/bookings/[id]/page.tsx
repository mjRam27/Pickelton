"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import PartnerSelect from "@/components/partner/PartnerSelect";
import { formatPartnerDate as formatDate, formatPartnerTime as formatTime } from "@/lib/partner-date";
import "./page.css";

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface Court {
  id: string;
  name: string | null;
  sport: string | null;
}

interface Booking {
  id: string;
  reference: string | null;
  starts_at: string;
  ends_at: string;
  status: string | null;
  payment_status: string | null;
  total_amount: number | null;
  notes: string | null;
  customer: Customer | Customer[] | null;
  court: Court | Court[] | null;
}

function getCustomer(
  customer: Booking["customer"]
): Customer | null {
  if (Array.isArray(customer)) {
    return customer[0] ?? null;
  }

  return customer;
}

function getCourt(
  court: Booking["court"]
): Court | null {
  if (Array.isArray(court)) {
    return court[0] ?? null;
  }

  return court;
}

function formatStatus(
  value: string | null
) {
  if (!value) return "Unknown";

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1).toLowerCase()
  );
}

function getDateInput(
  value: string
) {
  const date = new Date(value);

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTimeInput(
  value: string
) {
  const date = new Date(value);

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const bookingId = String(
    params.id
  );

  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [date, setDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [status, setStatus] =
    useState("CONFIRMED");

  const [paymentStatus, setPaymentStatus] =
    useState("PENDING");

  const [amount, setAmount] =
    useState("");

  const [notes, setNotes] =
    useState("");

  async function loadBooking() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } =
        await supabase
          .from("bookings")
          .select(`
            id,
            reference,
            starts_at,
            ends_at,
            status,
            payment_status,
            total_amount,
            notes,
            customer:customers (
              id,
              name,
              email,
              phone
            ),
            court:courts (
              id,
              name,
              sport
            )
          `)
          .eq("id", bookingId)
          .single();

      if (error) {
        console.error(
          "Booking details error:",
          error
        );

        setErrorMessage(
          error.message
        );

        return;
      }

      if (!data) {
        setErrorMessage(
          "Booking not found."
        );

        return;
      }

      const loadedBooking =
        data as Booking;

      setBooking(
        loadedBooking
      );

      setDate(
        getDateInput(
          loadedBooking.starts_at
        )
      );

      setStartTime(
        getTimeInput(
          loadedBooking.starts_at
        )
      );

      setEndTime(
        getTimeInput(
          loadedBooking.ends_at
        )
      );

      setStatus(
        loadedBooking.status ||
          "CONFIRMED"
      );

      setPaymentStatus(
        loadedBooking.payment_status ||
          "PENDING"
      );

      setAmount(
        String(
          loadedBooking.total_amount ??
            0
        )
      );

      setNotes(
        loadedBooking.notes || ""
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Something went wrong while loading the booking."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  async function handleCancelBooking() {
    if (!booking) return;

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this booking?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      const { error } =
        await supabase
          .from("bookings")
          .update({
            status: "CANCELLED",
          })
          .eq("id", booking.id);

      if (error) {
        console.error(
          "Cancel booking error:",
          error
        );

        alert(
          `Failed to cancel booking: ${error.message}`
        );

        return;
      }

      alert(
        "Booking cancelled successfully."
      );

      await loadBooking();
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while cancelling the booking."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveChanges(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!booking) return;

    if (!date) {
      alert(
        "Please select a booking date."
      );
      return;
    }

    if (!startTime || !endTime) {
      alert(
        "Please select start and end time."
      );
      return;
    }

    const startDate =
      new Date(
        `${date}T${startTime}:00`
      );

    const endDate =
      new Date(
        `${date}T${endTime}:00`
      );

    if (
      endDate.getTime() <=
      startDate.getTime()
    ) {
      alert(
        "End time must be after start time."
      );
      return;
    }

    try {
      setSaving(true);

      const startsAt =
        startDate.toISOString();

      const endsAt =
        endDate.toISOString();

      const { error } =
        await supabase
          .from("bookings")
          .update({
            starts_at: startsAt,
            ends_at: endsAt,
            status,
            payment_status:
              paymentStatus,
            total_amount:
              Number(amount) || 0,
            notes: notes || null,
          })
          .eq("id", booking.id);

      if (error) {
        console.error(
          "Update booking error:",
          error
        );

        alert(
          `Failed to update booking: ${error.message}`
        );

        return;
      }

      alert(
        "Booking updated successfully."
      );

      setEditing(false);

      await loadBooking();
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while updating the booking."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    if (!booking) return;

    setDate(
      getDateInput(
        booking.starts_at
      )
    );

    setStartTime(
      getTimeInput(
        booking.starts_at
      )
    );

    setEndTime(
      getTimeInput(
        booking.ends_at
      )
    );

    setStatus(
      booking.status ||
        "CONFIRMED"
    );

    setPaymentStatus(
      booking.payment_status ||
        "PENDING"
    );

    setAmount(
      String(
        booking.total_amount ?? 0
      )
    );

    setNotes(
      booking.notes || ""
    );

    setEditing(false);
  }

  if (loading) {
    return (
      <main
        className="booking-details-page"
        style={{
          padding: "40px",
        }}
      >
        Loading booking...
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main
        className="booking-details-page"
        style={{
          padding: "40px",
        }}
      >
        <Link
          href="/partner/bookings"
          className="booking-back-btn"
        >
          ← Back to Bookings
        </Link>

        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#ffe5e5",
            border:
              "1px solid #ffaaaa",
            borderRadius: "10px",
            color: "#b00020",
          }}
        >
          <strong>
            Unable to load booking
          </strong>

          <p>{errorMessage}</p>
        </div>
      </main>
    );
  }

  if (!booking) {
    return null;
  }

  const customer =
    getCustomer(
      booking.customer
    );

  const court =
    getCourt(
      booking.court
    );

  const customerName =
    customer?.name ||
    "Unknown Customer";

  const initials =
    customerName
      .split(" ")
      .filter(Boolean)
      .map(
        (name) => name[0]
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const durationMinutes =
    (new Date(
      booking.ends_at
    ).getTime() -
      new Date(
        booking.starts_at
      ).getTime()) /
    (1000 * 60);

  const duration =
    durationMinutes >= 60
      ? `${durationMinutes / 60} hour${
          durationMinutes / 60 ===
          1
            ? ""
            : "s"
        }`
      : `${durationMinutes} minutes`;

  return (
    <main className="booking-details-page">

      {/* HEADER */}

      <header className="booking-details-header">
        <div className="booking-header-content">
          <Link
            href="/partner/bookings"
            className="booking-back-btn"
          >
            <span aria-hidden="true">
              ←
            </span>
            Back
          </Link>

          <div>
            <span className="booking-page-tag">
              BOOKING
            </span>

            <h1>
              Booking Details
            </h1>

            <p>
              Booking ID:{" "}
              <strong>
                {booking.reference ||
                  booking.id}
              </strong>
            </p>
          </div>
        </div>

        <span
          className={`booking-status-badge ${
            booking.status ===
            "CANCELLED"
              ? "cancelled"
              : "confirmed"
          }`}
        >
          {formatStatus(
            booking.status
          )}
        </span>
      </header>

      {/* EDIT FORM */}

      {editing ? (
        <form
          onSubmit={
            handleSaveChanges
          }
          style={{
            marginBottom: "30px",
          }}
        >
          <section className="booking-details-card">
            <header className="booking-section-header">
              <span className="booking-section-tag">
                EDIT
              </span>

              <h2>
                Edit Booking
              </h2>
            </header>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "20px",
              }}
            >
              {/* DATE */}

              <div>
                <label
                  htmlFor="booking-date"
                  style={{
                    display: "block",
                    marginBottom:
                      "8px",
                    fontWeight: 700,
                  }}
                >
                  Booking Date
                </label>

                <input
                  id="booking-date"
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                />
              </div>

              {/* START */}

              <div>
                <label
                  htmlFor="booking-start"
                  style={{
                    display: "block",
                    marginBottom:
                      "8px",
                    fontWeight: 700,
                  }}
                >
                  Start Time
                </label>

                <input
                  id="booking-start"
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                />
              </div>

              {/* END */}

              <div>
                <label
                  htmlFor="booking-end"
                  style={{
                    display: "block",
                    marginBottom:
                      "8px",
                    fontWeight: 700,
                  }}
                >
                  End Time
                </label>

                <input
                  id="booking-end"
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                />
              </div>

              {/* AMOUNT */}

              <div>
                <label
                  htmlFor="booking-amount"
                  style={{
                    display: "block",
                    marginBottom:
                      "8px",
                    fontWeight: 700,
                  }}
                >
                  Total Amount
                </label>

                <input
                  id="booking-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                />
              </div>

              {/* STATUS */}

              <div>
                <label
                  htmlFor="booking-status"
                  style={{
                    display: "block",
                    marginBottom:
                      "8px",
                    fontWeight: 700,
                  }}
                >
                  Status
                </label>

                <PartnerSelect
                  id="booking-status"
                  value={status}
                  onValueChange={setStatus}
                  style={inputStyle}
                >
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
                </PartnerSelect>
              </div>

              {/* PAYMENT */}

              <div>
                <label
                  htmlFor="booking-payment"
                  style={{
                    display: "block",
                    marginBottom:
                      "8px",
                    fontWeight: 700,
                  }}
                >
                  Payment Status
                </label>

                <PartnerSelect
                  id="booking-payment"
                  value={
                    paymentStatus
                  }
                  onValueChange={setPaymentStatus}
                  style={inputStyle}
                >
                  <option value="PENDING">
                    Pending
                  </option>

                  <option value="PAID">
                    Paid
                  </option>

                  <option value="REFUNDED">
                    Refunded
                  </option>
                </PartnerSelect>
              </div>
            </div>

            {/* NOTES */}

            <div
              style={{
                marginTop: "20px",
              }}
            >
              <label
                htmlFor="booking-notes"
                style={{
                  display: "block",
                  marginBottom:
                    "8px",
                  fontWeight: 700,
                }}
              >
                Notes
              </label>

              <textarea
                id="booking-notes"
                rows={5}
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </div>

            {/* EDIT ACTIONS */}

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "25px",
              }}
            >
              <button
                type="submit"
                disabled={saving}
                className="booking-primary-btn"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={
                  handleCancelEdit
                }
                disabled={saving}
                className="booking-cancel-btn"
              >
                Cancel Edit
              </button>
            </div>
          </section>
        </form>
      ) : (
        <>
          {/* DETAILS */}

          <div className="booking-details-grid">

            {/* CUSTOMER */}

            <section className="booking-details-card">
              <header className="booking-section-header">
                <span className="booking-section-tag">
                  CUSTOMER
                </span>

                <h2>
                  Customer Information
                </h2>
              </header>

              <div className="booking-customer-profile">
                <div
                  className="booking-avatar"
                  aria-hidden="true"
                >
                  {initials}
                </div>

                <div>
                  <h3>
                    {customerName}
                  </h3>

                  <p>
                    Pickelton customer
                  </p>
                </div>
              </div>

              <dl className="booking-info-list">
                <div className="booking-info-row">
                  <dt>
                    Phone Number
                  </dt>

                  <dd>
                    {customer?.phone ||
                      "Not available"}
                  </dd>
                </div>

                <div className="booking-info-row">
                  <dt>
                    Email Address
                  </dt>

                  <dd>
                    {customer?.email ||
                      "Not available"}
                  </dd>
                </div>
              </dl>
            </section>

            {/* COURT */}

            <section className="booking-details-card">
              <header className="booking-section-header">
                <span className="booking-section-tag">
                  COURT
                </span>

                <h2>
                  Court Information
                </h2>
              </header>

              <dl className="booking-info-list">
                <div className="booking-info-row">
                  <dt>
                    Court Name
                  </dt>

                  <dd>
                    {court?.name ||
                      "Not available"}
                  </dd>
                </div>

                <div className="booking-info-row">
                  <dt>
                    Court Type
                  </dt>

                  <dd>
                    {court?.sport ||
                      "Not available"}
                  </dd>
                </div>

                <div className="booking-info-row">
                  <dt>
                    Surface
                  </dt>

                  <dd>
                    Not available
                  </dd>
                </div>
              </dl>
            </section>

            {/* SCHEDULE */}

            <section className="booking-details-card booking-schedule-card">
              <header className="booking-section-header">
                <span className="booking-section-tag">
                  SCHEDULE
                </span>

                <h2>
                  Booking Information
                </h2>
              </header>

              <dl className="booking-summary-grid">
                <div className="booking-summary-item">
                  <dt>
                    Booking Date
                  </dt>

                  <dd>
                    {formatDate(
                      booking.starts_at
                    )}
                  </dd>
                </div>

                <div className="booking-summary-item">
                  <dt>
                    Time Slot
                  </dt>

                  <dd>
                    {formatTime(
                      booking.starts_at
                    )}
                    {" – "}
                    {formatTime(
                      booking.ends_at
                    )}
                  </dd>
                </div>

                <div className="booking-summary-item">
                  <dt>
                    Duration
                  </dt>

                  <dd>
                    {duration}
                  </dd>
                </div>

                <div className="booking-summary-item booking-price">
                  <dt>
                    Price
                  </dt>

                  <dd>
                    ₹
                    {Number(
                      booking.total_amount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            {/* PAYMENT */}

            <section className="booking-details-card">
              <header className="booking-section-header">
                <span className="booking-section-tag">
                  PAYMENT
                </span>

                <h2>
                  Payment Information
                </h2>
              </header>

              <dl className="booking-info-list">
                <div className="booking-info-row">
                  <dt>
                    Payment Status
                  </dt>

                  <dd>
                    <span className="booking-payment-status">
                      {formatStatus(
                        booking.payment_status
                      )}
                    </span>
                  </dd>
                </div>

                <div className="booking-info-row">
                  <dt>
                    Payment Method
                  </dt>

                  <dd>
                    Not available
                  </dd>
                </div>
              </dl>
            </section>

            {/* NOTES */}

            <section className="booking-details-card booking-notes-card">
              <header className="booking-section-header">
                <span className="booking-section-tag">
                  NOTES
                </span>

                <h2>
                  Customer Notes
                </h2>
              </header>

              <p className="booking-notes">
                {booking.notes ||
                  "No notes added for this booking."}
              </p>
            </section>
          </div>

          {/* ACTIONS */}

          <footer className="booking-bottom-actions">
            <button
              type="button"
              className="booking-cancel-btn"
              onClick={
                handleCancelBooking
              }
              disabled={
                saving ||
                booking.status ===
                  "CANCELLED"
              }
            >
              {saving
                ? "Processing..."
                : booking.status ===
                  "CANCELLED"
                ? "Booking Cancelled"
                : "Cancel Booking"}
            </button>

            <button
              type="button"
              className="booking-primary-btn"
              onClick={() =>
                setEditing(true)
              }
              disabled={
                saving ||
                booking.status ===
                  "CANCELLED"
              }
            >
              Edit Booking
            </button>
          </footer>
        </>
      )}
    </main>
  );
}

const inputStyle: React.CSSProperties =
  {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box",
  };
