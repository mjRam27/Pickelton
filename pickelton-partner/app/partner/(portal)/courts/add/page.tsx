"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentAccessToken } from "@/lib/supabase-access-token";
import PartnerSelect from "@/components/partner/PartnerSelect";
import "./page.css";

export default function AddCourtPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [indoor, setIndoor] = useState(false);
  const [membershipEnabled, setMembershipEnabled] = useState(false);
  const [surface, setSurface] = useState("Acrylic");
  const [hourlyRate, setHourlyRate] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);

    try {
      const token = await getCurrentAccessToken();
      const response = await fetch("http://localhost:8090/api/v1/courts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          sport: "PICKLEBALL",
          surface,
          indoor,
          membershipEnabled,
          hourlyRate: Number(hourlyRate),
          description,
          status: "ACTIVE",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error?.message ?? "Failed to save court");
        return;
      }

      alert("Court saved successfully!");
      router.push("/partner/courts");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Could not connect to the backend.");
      router.push("/partner/login");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-court-page">
      <section className="add-court-hero">
        <span className="add-court-hero-orbit add-court-hero-orbit-large" />
        <span className="add-court-hero-orbit add-court-hero-orbit-small" />

        <div className="add-court-hero-copy">
          <span className="add-court-eyebrow">ADD COURT</span>
          <h1>Add New Court</h1>
          <p>Create a new pickleball court.</p>
        </div>
      </section>

      {/* Form Section */}
      <div className="form-card">
        <form className="court-form" onSubmit={handleSave}>
          <div className="form-group">
            <label>Court Name</label>
            <input
              type="text"
              placeholder="Court 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Court Type</label>
            <PartnerSelect
              value={indoor ? "Indoor" : "Outdoor"}
              onValueChange={(value) => setIndoor(value === "Indoor")}
            >
              <option>Outdoor</option>
              <option>Indoor</option>
            </PartnerSelect>
          </div>

          <div className="form-group">
            <label>Surface</label>
            <PartnerSelect
              value={surface}
              onValueChange={setSurface}
            >
              <option>Acrylic</option>
              <option>Wooden</option>
              <option>Synthetic</option>
            </PartnerSelect>
          </div>

          <div className="form-group">
            <label>Price / Hour</label>
            <input
              type="number"
              placeholder="500"
              min="0"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              required
            />
          </div>

          <div className="form-group full">
            <label className="membership-option">
              <input
                type="checkbox"
                checked={membershipEnabled}
                onChange={(event) =>
                  setMembershipEnabled(event.target.checked)
                }
              />
              <span>
                <strong>Membership Available</strong>
                <small>Customers may optionally take a membership for this court in the future.</small>
              </span>
            </label>
          </div>

          <div className="form-group full">
            <label>Description</label>
            <textarea
              rows={5}
              placeholder="Describe this court..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <Link href="/partner/courts" className="secondary-btn">
              Cancel
            </Link>

            <button
              className="primary-btn"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Court"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
