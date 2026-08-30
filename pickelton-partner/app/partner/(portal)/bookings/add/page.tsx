"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import PartnerSelect from "@/components/partner/PartnerSelect";
import "./page.css";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Court {
  id: string;
  name: string;
  sport: string;
}

function NewBookingHeader() {
  return (
    <>
      <Link href="/partner/bookings">← Back to Bookings</Link>

      <section className="new-booking-hero">
        <span className="new-booking-hero-orbit new-booking-hero-orbit-large" />
        <span className="new-booking-hero-orbit new-booking-hero-orbit-small" />

        <div className="new-booking-hero-copy">
          <span className="new-booking-eyebrow">NEW BOOKING</span>
          <h1>New Booking</h1>
          <p>Create a new booking for a customer.</p>
        </div>
      </section>
    </>
  );
}

export default function AddBookingPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [courtId, setCourtId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [amount, setAmount] = useState("");

  const [status, setStatus] = useState("CONFIRMED");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Auth error:", userError);
          alert(`Authentication error: ${userError.message}`);
          return;
        }

        if (!user) {
          alert("You are not logged in.");
          router.push("/partner/login");
          return;
        }

        const [customersResult, courtsResult] = await Promise.all([
          supabase
            .from("customers")
            .select("id, name, email, phone")
            .order("name"),

          supabase
            .from("courts")
            .select("id, name, sport")
            .order("name"),
        ]);

        if (customersResult.error) {
          console.error(
            "Customers error:",
            customersResult.error
          );

          alert(
            `Failed to load customers: ${customersResult.error.message}`
          );

          return;
        }

        if (courtsResult.error) {
          console.error(
            "Courts error:",
            courtsResult.error
          );

          alert(
            `Failed to load courts: ${courtsResult.error.message}`
          );

          return;
        }

        setCustomers(customersResult.data || []);
        setCourts(courtsResult.data || []);
      } catch (error) {
        console.error("Load data error:", error);
        alert("Failed to load booking data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!customerId) {
      alert("Please select a customer.");
      return;
    }

    if (!courtId) {
      alert("Please select a court.");
      return;
    }

    if (!date) {
      alert("Please select a booking date.");
      return;
    }

    if (!startTime || !endTime) {
      alert("Please select start and end time.");
      return;
    }

    if (endTime <= startTime) {
      alert("End time must be after start time.");
      return;
    }

    if (!amount || Number(amount) < 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      setSaving(true);

      // ------------------------------------------------
      // 1. Get currently logged-in Supabase user
      // ------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Auth error:", userError);
        alert(`Authentication error: ${userError.message}`);
        return;
      }

      if (!user || !user.email) {
        alert("You are not logged in.");
        router.push("/partner/login");
        return;
      }

      console.log("Logged in user:", user.email);

      // ------------------------------------------------
      // 2. Find the partner using the logged-in email
      // ------------------------------------------------

      const {
        data: partner,
        error: partnerError,
      } = await supabase
        .from("partners")
        .select("id, business_name, email")
        .eq("email", user.email)
        .single();

      if (partnerError) {
        console.error("Partner lookup error:", partnerError);

        alert(
          `Could not find your partner account: ${partnerError.message}`
        );

        return;
      }

      if (!partner) {
        alert("Partner account not found.");
        return;
      }

      console.log("Partner:", partner);

      // ------------------------------------------------
      // 3. Create booking date/time
      // ------------------------------------------------

      const startsAt = new Date(
        `${date}T${startTime}:00`
      ).toISOString();

      const endsAt = new Date(
        `${date}T${endTime}:00`
      ).toISOString();

      // ------------------------------------------------
      // 4. Generate booking reference
      // ------------------------------------------------

      const reference = `BOOKING-${Date.now()}`;

      // ------------------------------------------------
      // 5. Insert booking
      // ------------------------------------------------

      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          partner_id: partner.id,
          customer_id: customerId,
          court_id: courtId,

          reference,

          starts_at: startsAt,
          ends_at: endsAt,

          status,
          payment_status: paymentStatus,

          total_amount: Number(amount),

          notes: notes.trim() || null,
        });

      if (bookingError) {
        console.error(
          "Create booking error:",
          bookingError
        );

        alert(
          `Failed to create booking: ${bookingError.message}`
        );

        return;
      }

      // ------------------------------------------------
      // 6. Success
      // ------------------------------------------------

      alert("Booking created successfully.");

      router.push("/partner/bookings");
      router.refresh();
    } catch (error) {
      console.error("Unexpected booking error:", error);

      alert(
        "Something went wrong while creating the booking."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main
        style={{
          maxWidth: "850px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <NewBookingHeader />
        <p className="new-booking-loading">Loading booking form...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <NewBookingHeader />

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: "30px",
        }}
      >
        {/* CUSTOMER */}

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="customer"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Customer
          </label>

          <PartnerSelect
            id="customer"
            value={customerId}
            onValueChange={setCustomerId}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
            }}
          >
            <option value="">
              Select customer
            </option>

            {customers.map((customer) => (
              <option
                key={customer.id}
                value={customer.id}
              >
                {customer.name} — {customer.phone}
              </option>
            ))}
          </PartnerSelect>
        </div>

        {/* COURT */}

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="court"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Court
          </label>

          <PartnerSelect
            id="court"
            value={courtId}
            onValueChange={setCourtId}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
            }}
          >
            <option value="">
              Select court
            </option>

            {courts.map((court) => (
              <option
                key={court.id}
                value={court.id}
              >
                {court.name} — {court.sport}
              </option>
            ))}
          </PartnerSelect>
        </div>

        {/* DATE */}

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="date"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Booking Date
          </label>

          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
            }}
          />
        </div>

        {/* TIME */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div>
            <label
              htmlFor="startTime"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Start Time
            </label>

            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(event) =>
                setStartTime(event.target.value)
              }
              disabled={saving}
              style={{
                width: "100%",
                padding: "12px",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="endTime"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              End Time
            </label>

            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(event) =>
                setEndTime(event.target.value)
              }
              disabled={saving}
              style={{
                width: "100%",
                padding: "12px",
              }}
            />
          </div>
        </div>

        {/* AMOUNT */}

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="amount"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Total Amount
          </label>

          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            disabled={saving}
            placeholder="1200"
            style={{
              width: "100%",
              padding: "12px",
            }}
          />
        </div>

        {/* STATUS */}

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="status"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Status
          </label>

          <PartnerSelect
            id="status"
            value={status}
            onValueChange={setStatus}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
            }}
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

            <option value="REJECTED">
              Rejected
            </option>
          </PartnerSelect>
        </div>

        {/* PAYMENT STATUS */}

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="payment"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Payment Status
          </label>

          <PartnerSelect
            id="payment"
            value={paymentStatus}
            onValueChange={setPaymentStatus}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
            }}
          >
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
        </div>

        {/* NOTES */}

        <div style={{ marginBottom: "25px" }}>
          <label
            htmlFor="notes"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Notes
          </label>

          <textarea
            id="notes"
            rows={5}
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            disabled={saving}
            placeholder="Customer notes..."
            style={{
              width: "100%",
              padding: "12px",
            }}
          />
        </div>

        {/* BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 24px",
              cursor: saving
                ? "not-allowed"
                : "pointer",
            }}
          >
            {saving
              ? "Creating..."
              : "Create Booking"}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              router.push("/partner/bookings")
            }
            style={{
              padding: "12px 24px",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
