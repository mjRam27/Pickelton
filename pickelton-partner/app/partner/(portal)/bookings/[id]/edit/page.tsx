"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import PartnerSelect from "@/components/partner/PartnerSelect";

export default function EditBookingPage() {
  const params = useParams();
  const router = useRouter();

  const bookingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadBooking() {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            id,
            status,
            payment_status,
            notes
          `)
          .eq("id", bookingId)
          .single();

        if (error) {
          console.error(
            "Load booking error:",
            error
          );

          alert(
            `Unable to load booking: ${error.message}`
          );

          return;
        }

        setStatus(data.status || "");
        setPaymentStatus(
          data.payment_status || ""
        );
        setNotes(data.notes || "");

      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const handleSave = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setSaving(true);

      const { error } = await supabase
        .from("bookings")
        .update({
          status,
          payment_status: paymentStatus,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

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

      alert("Booking updated successfully.");

      router.push(
        `/partner/bookings/${bookingId}`
      );

      router.refresh();

    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while updating the booking."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main
        style={{
          padding: "40px",
          fontFamily: "Arial",
        }}
      >
        Loading booking...
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <Link
        href={`/partner/bookings/${bookingId}`}
      >
        ← Back to Booking
      </Link>

      <h1
        style={{
          marginTop: "30px",
          marginBottom: "30px",
        }}
      >
        Edit Booking
      </h1>

      <form onSubmit={handleSave}>

        {/* STATUS */}

        <div
          style={{
            marginBottom: "24px",
          }}
        >
          <label
            htmlFor="status"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Booking Status
          </label>

          <PartnerSelect
            id="status"
            value={status}
            onValueChange={setStatus}
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
          </PartnerSelect>
        </div>

        {/* PAYMENT */}

        <div
          style={{
            marginBottom: "24px",
          }}
        >
          <label
            htmlFor="payment_status"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Payment Status
          </label>

          <PartnerSelect
            id="payment_status"
            value={paymentStatus}
            onValueChange={setPaymentStatus}
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

            <option value="REFUNDED">
              Refunded
            </option>
          </PartnerSelect>
        </div>

        {/* NOTES */}

        <div
          style={{
            marginBottom: "24px",
          }}
        >
          <label
            htmlFor="notes"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Customer Notes
          </label>

          <textarea
            id="notes"
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            rows={6}
            style={{
              width: "100%",
              padding: "12px",
              resize: "vertical",
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
              ? "Saving..."
              : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/partner/bookings/${bookingId}`
              )
            }
            style={{
              padding: "12px 24px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>

      </form>
    </main>
  );
}
