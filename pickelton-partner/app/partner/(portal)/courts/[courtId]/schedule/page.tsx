"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Lock,
  Save,
  Wrench,
} from "lucide-react";
import { formatPartnerDate } from "@/lib/partner-date";
import "./page.css";

type SlotStatus = "available" | "booked" | "maintenance";

type TimeSlot = {
  time: string;
  status: SlotStatus;
};

type BackendCourt = {
  id: string;
  name: string;
  sport?: string;
  surface?: string | null;
  indoor?: boolean;
  hourly_rate?: number;
  description?: string | null;
  status?: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
};

const DEFAULT_TIMES = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
];

function createDefaultSlots(): TimeSlot[] {
  return DEFAULT_TIMES.map((time) => ({
    time,
    status: "available",
  }));
}

function getStorageKey(courtId: string, date: string) {
  return `pickelton_schedule_${courtId}_${date}`;
}

export default function ManageSchedulePage() {
  const params = useParams();
  const router = useRouter();

  const courtId = String(params.courtId);

  const [court, setCourt] = useState<BackendCourt | null>(null);

  const [slots, setSlots] = useState<TimeSlot[]>(
    createDefaultSlots()
  );

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // --------------------------------
  // LOAD COURT
  // --------------------------------

  useEffect(() => {
    async function loadCourt() {
      try {
        setLoading(true);

        const token = localStorage.getItem("partner_token");

        if (!token) {
          setMessage("Partner login session not found.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:8090/api/v1/courts/${courtId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error?.message ||
              "Failed to load court."
          );
        }

        setCourt(result?.data ?? result);
      } catch (error) {
        console.error("Failed to load court:", error);

        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load court."
        );
      } finally {
        setLoading(false);
      }
    }

    if (courtId) {
      loadCourt();
    }
  }, [courtId]);

  // --------------------------------
  // LOAD SCHEDULE
  // --------------------------------

  useEffect(() => {
    if (!courtId || !selectedDate) return;

    const key = getStorageKey(
      courtId,
      selectedDate
    );

    const saved = localStorage.getItem(key);

    if (!saved) {
      setSlots(createDefaultSlots());
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      // Make sure all 12 slots exist
      const validSlots: TimeSlot[] =
        DEFAULT_TIMES.map((time) => {
          const existing = parsed.find(
            (slot: TimeSlot) => slot.time === time
          );

          return {
            time,
            status:
              existing?.status === "maintenance"
                ? "maintenance"
                : existing?.status === "booked"
                ? "booked"
                : "available",
          };
        });

      setSlots(validSlots);
    } catch (error) {
      console.error(
        "Invalid saved schedule:",
        error
      );

      setSlots(createDefaultSlots());
    }

    setMessage("");
  }, [courtId, selectedDate]);

  // --------------------------------
  // CLICK SLOT
  // --------------------------------

  const handleSlotClick = (index: number) => {
    setMessage("");

    setSlots((current) =>
      current.map((slot, slotIndex) => {
        if (slotIndex !== index) {
          return slot;
        }

        // Booked slots cannot be changed
        if (slot.status === "booked") {
          return slot;
        }

        return {
          ...slot,
          status:
            slot.status === "available"
              ? "maintenance"
              : "available",
        };
      })
    );
  };

  // --------------------------------
  // SAVE
  // --------------------------------

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const key = getStorageKey(
        courtId,
        selectedDate
      );

      localStorage.setItem(
        key,
        JSON.stringify(slots)
      );

      // Tell other pages/tabs that schedule changed
      window.dispatchEvent(
        new CustomEvent("scheduleUpdated", {
          detail: {
            courtId,
            date: selectedDate,
            slots,
          },
        })
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      );

      setMessage("Schedule saved successfully.");
    } catch (error) {
      console.error(
        "Failed to save schedule:",
        error
      );

      setMessage("Failed to save schedule.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------
  // RESET
  // --------------------------------

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset this day's schedule to all available slots?"
    );

    if (!confirmed) return;

    const resetSlots = createDefaultSlots();

    setSlots(resetSlots);

    const key = getStorageKey(
      courtId,
      selectedDate
    );

    localStorage.setItem(
      key,
      JSON.stringify(resetSlots)
    );

    window.dispatchEvent(
      new CustomEvent("scheduleUpdated", {
        detail: {
          courtId,
          date: selectedDate,
          slots: resetSlots,
        },
      })
    );

    setMessage(
      "Schedule reset successfully."
    );
  };

  // --------------------------------
  // COUNTS
  // --------------------------------

  const availableCount = useMemo(
    () =>
      slots.filter(
        (slot) =>
          slot.status === "available"
      ).length,
    [slots]
  );

  const bookedCount = useMemo(
    () =>
      slots.filter(
        (slot) =>
          slot.status === "booked"
      ).length,
    [slots]
  );

  const maintenanceCount = useMemo(
    () =>
      slots.filter(
        (slot) =>
          slot.status === "maintenance"
      ).length,
    [slots]
  );

  const formattedDate = formatPartnerDate(selectedDate);

  // --------------------------------
  // LOADING
  // --------------------------------

  if (loading) {
    return (
      <main className="schedule-page">
        <div className="schedule-loading">
          <Clock3 size={24} />

          <h2>Loading court...</h2>

          <p>
            Fetching court information from
            Pickelton.
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------
  // PAGE
  // --------------------------------

  return (
    <main className="schedule-page">

      {/* TOP BAR */}

      <header className="schedule-topbar">

        <button
          type="button"
          className="back-button"
          onClick={() =>
            router.push("/partner/courts")
          }
        >
          <ArrowLeft size={17} />
          Back to Courts
        </button>

        <div className="date-selector">

          <CalendarDays size={17} />

          <input
            type="date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(
                event.target.value
              )
            }
          />

        </div>

      </header>

      {/* HERO */}

      <section className="schedule-hero">

        <div>

          <span className="eyebrow">
            COURT MANAGEMENT
          </span>

          <h1>
            Manage Schedule
          </h1>

          <p>
            Manage availability and daily
            time slots for this court.
          </p>

        </div>

        <div className="court-info-card">

          <span>Court</span>

          <strong>
            {court?.name || "Court"}
          </strong>

          <small>
            {court?.sport ||
              "Court schedule"}
          </small>

        </div>

      </section>

      {/* SELECTED DATE */}

      <section className="selected-day">

        <div>

          <CalendarDays size={20} />

          <div>

            <span>
              Selected date
            </span>

            <strong>
              {formattedDate}
            </strong>

          </div>

        </div>

        <button
          type="button"
          onClick={() => {
            const today =
              new Date()
                .toISOString()
                .split("T")[0];

            setSelectedDate(today);
          }}
        >
          Today
        </button>

      </section>

      {/* STATS */}

      <section className="schedule-stats">

        <article className="available-stat">

          <div>
            <CheckCircle2 size={20} />
          </div>

          <span>
            Available
          </span>

          <strong>
            {availableCount}
          </strong>

          <small>
            Open for booking
          </small>

        </article>

        <article className="booked-stat">

          <div>
            <Lock size={20} />
          </div>

          <span>
            Booked
          </span>

          <strong>
            {bookedCount}
          </strong>

          <small>
            Already reserved
          </small>

        </article>

        <article className="maintenance-stat">

          <div>
            <Wrench size={20} />
          </div>

          <span>
            Maintenance
          </span>

          <strong>
            {maintenanceCount}
          </strong>

          <small>
            Temporarily unavailable
          </small>

        </article>

      </section>

      {/* SCHEDULE */}

      <section className="schedule-panel">

        <header className="schedule-panel-header">

          <div>

            <span className="eyebrow">
              TODAY&apos;S OPERATIONS
            </span>

            <h2>
              Availability Schedule
            </h2>

            <p>
              Click an available slot to disable
              it. Click a maintenance slot to make
              it available again.
            </p>

          </div>

        </header>

        {/* MESSAGE */}

        {message && (
          <div
            className={
              message.includes(
                "successfully"
              )
                ? "schedule-message success"
                : "schedule-message"
            }
          >
            {message}
          </div>
        )}

        {/* SLOTS */}

        <div className="slot-grid">

          {slots.map((slot, index) => {

            const isBooked =
              slot.status === "booked";

            return (
              <button
                type="button"
                key={slot.time}
                className={`time-slot ${slot.status}`}
                onClick={() =>
                  handleSlotClick(index)
                }
                disabled={isBooked}
                aria-label={`${slot.time} ${slot.status}`}
              >

                <div className="slot-top">

                  {slot.status ===
                    "available" && (
                    <CheckCircle2 size={17} />
                  )}

                  {slot.status ===
                    "booked" && (
                    <Lock size={17} />
                  )}

                  {slot.status ===
                    "maintenance" && (
                    <Wrench size={17} />
                  )}

                  <span>
                    {slot.status ===
                    "available"
                      ? "Available"
                      : slot.status ===
                        "booked"
                      ? "Booked"
                      : "Maintenance"}
                  </span>

                </div>

                <strong>
                  {slot.time}
                </strong>

                <small>
                  {slot.status ===
                    "available" &&
                    "Open for booking"}

                  {slot.status ===
                    "booked" &&
                    "Court reserved"}

                  {slot.status ===
                    "maintenance" &&
                    "Unavailable"}
                </small>

              </button>
            );
          })}

        </div>

        {/* LEGEND */}

        <footer className="schedule-legend">

          <span>
            <i className="legend-dot available" />
            Available
          </span>

          <span>
            <i className="legend-dot booked" />
            Booked
          </span>

          <span>
            <i className="legend-dot maintenance" />
            Maintenance
          </span>

        </footer>

      </section>

      {/* BOTTOM ACTIONS */}

      <section className="schedule-actions">

        <div>

          <h3>
            Schedule controls
          </h3>

          <p>
            Changes are saved for this court
            and selected date.
          </p>

        </div>

        <div>

          <button
            type="button"
            className="reset-button"
            onClick={handleReset}
          >
            Reset Day
          </button>

          <button
            type="button"
            className="primary-action"
            onClick={handleSave}
            disabled={saving}
          >

            <Save size={16} />

            {saving
              ? "Saving..."
              : "Save Changes"}

          </button>

        </div>

      </section>

    </main>
  );
}
