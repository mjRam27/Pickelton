"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  IndianRupee,
  Save,
  TriangleAlert,
} from "lucide-react";
import { getCurrentAccessToken } from "@/lib/supabase-access-token";
import PartnerSelect from "@/components/partner/PartnerSelect";
import "./page.css";

type Court = {
  id: string;
  name: string;
  sport: "PICKLEBALL" | "BADMINTON" | "MULTI_SPORT";
  surface?: string | null;
  indoor: boolean;
  membership_enabled: boolean;
  hourly_rate: number;
  description?: string | null;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
};

export default function EditCourtPage() {
  const params = useParams();
  const router = useRouter();

  const courtId = params.id as string;

  const [court, setCourt] = useState<Court | null>(null);

  const [name, setName] = useState("");
  const [sport, setSport] = useState<
    "PICKLEBALL" | "BADMINTON" | "MULTI_SPORT"
  >("PICKLEBALL");
  const [surface, setSurface] = useState("");
  const [indoor, setIndoor] = useState(false);
  const [membershipEnabled, setMembershipEnabled] = useState(false);
  const [hourlyRate, setHourlyRate] = useState("");
  const [status, setStatus] = useState<
    "ACTIVE" | "MAINTENANCE" | "INACTIVE"
  >("ACTIVE");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadCourt() {
      try {
        setLoading(true);
        setError("");

        const token = await getCurrentAccessToken();

        const response = await fetch(
          `http://localhost:8090/api/v1/courts/${courtId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error?.message || "Failed to load court",
          );
        }

        const data: Court = result?.data ?? result;

        setCourt(data);

        setName(data.name);
        setSport(data.sport);
        setSurface(data.surface ?? "");
        setIndoor(data.indoor);
        setMembershipEnabled(data.membership_enabled);
        setHourlyRate(String(data.hourly_rate));
        setStatus(data.status);
        setDescription(data.description ?? "");
      } catch (err) {
        console.error("Failed to load court:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load court",
        );
      } finally {
        setLoading(false);
      }
    }

    if (courtId) {
      loadCourt();
    }
  }, [courtId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = await getCurrentAccessToken();

      const numericRate = Number(hourlyRate);

      if (!name.trim()) {
        setError("Court name is required.");
        return;
      }

      if (!Number.isFinite(numericRate) || numericRate < 0) {
        setError("Please enter a valid hourly rate.");
        return;
      }

      const response = await fetch(
        `http://localhost:8090/api/v1/courts/${courtId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            sport,
            surface: surface.trim() || undefined,
            indoor,
            membershipEnabled,
            hourlyRate: numericRate,
            description: description.trim() || undefined,
            status,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error?.message || "Failed to update court",
        );
      }

      const updatedCourt: Court = result?.data ?? result;

      setCourt(updatedCourt);

      setName(updatedCourt.name);
      setSport(updatedCourt.sport);
      setSurface(updatedCourt.surface ?? "");
      setIndoor(updatedCourt.indoor);
      setMembershipEnabled(updatedCourt.membership_enabled);
      setHourlyRate(String(updatedCourt.hourly_rate));
      setStatus(updatedCourt.status);
      setDescription(updatedCourt.description ?? "");

      setSuccess("Court updated successfully.");

      setTimeout(() => {
        router.push("/partner/courts");
      }, 800);
    } catch (err) {
      console.error("Failed to update court:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update court",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="edit-court-page">
        <div className="edit-loading">
          <div className="loading-spinner" />
          <h2>Loading court...</h2>
          <p>Fetching the latest court information.</p>
        </div>
      </main>
    );
  }

  if (error && !court) {
    return (
      <main className="edit-court-page">
        <section className="edit-error-card">
          <TriangleAlert size={32} />
          <h1>Unable to load court</h1>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => router.push("/partner/courts")}
          >
            <ArrowLeft size={16} />
            Back to Courts
          </button>
        </section>
      </main>
    );
  }

  if (!court) {
    return null;
  }

  return (
    <main className="edit-court-page">
      <section className="edit-court-header">
        <div>
          <span className="edit-eyebrow">COURT MANAGEMENT</span>

          <h1>Edit Court</h1>

          <p>
            Update the details for{" "}
            <strong>{court.name}</strong>
          </p>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={() => router.push("/partner/courts")}
        >
          <ArrowLeft size={16} />
          Back to Courts
        </button>
      </section>

      {error && (
        <div className="alert alert-error">
          <TriangleAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <form
        className="edit-court-card"
        onSubmit={handleSubmit}
      >
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="court-name">
              Court Name
            </label>

            <input
              id="court-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter court name"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="sport">
              Sport
            </label>

            <PartnerSelect
              id="sport"
              value={sport}
              onValueChange={(value) =>
                setSport(
                  value as Court["sport"],
                )
              }
            >
              <option value="PICKLEBALL">
                PICKLEBALL
              </option>

              <option value="BADMINTON">
                BADMINTON
              </option>

              <option value="MULTI_SPORT">
                MULTI SPORT
              </option>
            </PartnerSelect>
          </div>

          <div className="form-field">
            <label htmlFor="surface">
              Surface
            </label>

            <input
              id="surface"
              type="text"
              value={surface}
              onChange={(event) =>
                setSurface(event.target.value)
              }
              placeholder="e.g. Acrylic"
            />
          </div>

          <div className="form-field">
            <label htmlFor="court-type">
              Court Type
            </label>

            <PartnerSelect
              id="court-type"
              value={indoor ? "INDOOR" : "OUTDOOR"}
              onValueChange={(value) =>
                setIndoor(value === "INDOOR")
              }
            >
              <option value="OUTDOOR">
                Outdoor
              </option>

              <option value="INDOOR">
                Indoor
              </option>
            </PartnerSelect>
          </div>

          <div className="form-field">
            <label htmlFor="hourly-rate">
              Hourly Rate
            </label>

            <div className="input-with-icon">
              <IndianRupee size={16} />

              <input
                id="hourly-rate"
                type="number"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={(event) =>
                  setHourlyRate(event.target.value)
                }
                placeholder="600"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="status">
              Status
            </label>

            <PartnerSelect
              id="status"
              value={status}
              onValueChange={(value) =>
                setStatus(
                  value as Court["status"],
                )
              }
            >
              <option value="ACTIVE">
                Active
              </option>

              <option value="MAINTENANCE">
                Maintenance
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </PartnerSelect>
          </div>

          <div className="form-field full-width">
            <label className="membership-option" htmlFor="membership-enabled">
              <input
                id="membership-enabled"
                type="checkbox"
                checked={membershipEnabled}
                onChange={(event) =>
                  setMembershipEnabled(event.target.checked)
                }
              />
              <span>
                <strong>Membership Available</strong>
                <small>Indicates that this court can offer optional membership.</small>
              </span>
            </label>
          </div>

          <div className="form-field full-width">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe this court..."
              rows={5}
            />
          </div>
        </div>

        <div className="form-divider" />

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => router.push("/partner/courts")}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="button-spinner" />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
