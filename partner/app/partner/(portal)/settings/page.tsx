// partner/app/partner/(portal)/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { PartnerSettings } from "@pickelton/types";
import { LoadError, Loading, Notice, PageHeader, Segmented, Switch } from "../../../../components/ui";
import { errorMessage, partnerApi, useResource } from "../../../../lib/partner";

type BookingRules = { advanceDays: number; freeCancellationHours: number; autoConfirm: boolean; waitlist: boolean };
type Notifications = { emailNewBookings: boolean; dailySummary: boolean };
type Theme = "system" | "light" | "dark";

const DEFAULT_RULES: BookingRules = { advanceDays: 14, freeCancellationHours: 24, autoConfirm: false, waitlist: true };
const DEFAULT_NOTIFICATIONS: Notifications = { emailNewBookings: true, dailySummary: false };
const THEME_KEY = "pickelton.partner.theme";

function applyTheme(theme: Theme) {
  try {
    if (theme === "system") {
      localStorage.removeItem(THEME_KEY);
      delete document.documentElement.dataset.theme;
    } else {
      localStorage.setItem(THEME_KEY, theme);
      document.documentElement.dataset.theme = theme;
    }
  } catch {
    // Theme is a per-device convenience; ignore storage failures.
  }
}

export default function SettingsPage() {
  const { data, setData, error: loadError, loading, reload } = useResource(() => partnerApi.settings.get());
  const [rules, setRules] = useState<BookingRules>(DEFAULT_RULES);
  const [notifications, setNotifications] = useState<Notifications>(DEFAULT_NOTIFICATIONS);
  const [theme, setTheme] = useState<Theme>("system");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!data) return;
    setRules({ ...DEFAULT_RULES, ...(data.bookingRules as Partial<BookingRules> | undefined) });
    setNotifications({ ...DEFAULT_NOTIFICATIONS, ...(data.notifications as Partial<Notifications> | undefined) });
  }, [data]);

  useEffect(() => {
    const saved = document.documentElement.dataset.theme;
    setTheme(saved === "light" || saved === "dark" ? saved : "system");
  }, []);

  async function save() {
    if (!data) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved: PartnerSettings = await partnerApi.settings.save({ ...data, bookingRules: rules, notifications });
      setData(saved);
      setMessage("Settings saved.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  const header = (
    <PageHeader sub="Booking rules, notifications and appearance" title="Settings">
      <button className="btn primary" disabled={saving || !data} onClick={save} type="button">{saving ? <span className="spinner" /> : null}Save settings</button>
    </PageHeader>
  );
  if (loading && !data) return <>{header}<Loading label="Loading settings" /></>;
  if (!data) return <>{header}<LoadError message={loadError} onRetry={reload} /></>;

  return (
    <>
      {header}
      <Notice message={error} />
      <Notice message={message} tone="success" />
      <div className="settingsGrid">
        <section className="card padded">
          <h2>Booking rules</h2>
          <div className="formGrid">
            <div className="field">
              <label htmlFor="st-adv">Players can book up to</label>
              <select className="input" id="st-adv" onChange={(event) => setRules((current) => ({ ...current, advanceDays: Number(event.target.value) }))} value={rules.advanceDays}>
                {[7, 14, 30, 60].map((days) => <option key={days} value={days}>{days} days ahead</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="st-cx">Free cancellation</label>
              <select className="input" id="st-cx" onChange={(event) => setRules((current) => ({ ...current, freeCancellationHours: Number(event.target.value) }))} value={rules.freeCancellationHours}>
                {[6, 12, 24, 48].map((hours) => <option key={hours} value={hours}>Up to {hours} h before</option>)}
              </select>
            </div>
          </div>
          <div className="toggleRow"><span><strong>Confirm bookings automatically</strong><small>Skip the pending step for online bookings</small></span><Switch checked={rules.autoConfirm} label="Confirm bookings automatically" onChange={(value) => setRules((current) => ({ ...current, autoConfirm: value }))} /></div>
          <div className="toggleRow"><span><strong>Waitlist for full slots</strong><small>Offer cancelled slots to the next player</small></span><Switch checked={rules.waitlist} label="Waitlist for full slots" onChange={(value) => setRules((current) => ({ ...current, waitlist: value }))} /></div>
        </section>
        <section className="card padded">
          <h2>Notifications &amp; appearance</h2>
          <div className="toggleRow"><span><strong>Email me new bookings</strong><small>Sent to your login email</small></span><Switch checked={notifications.emailNewBookings} label="Email me new bookings" onChange={(value) => setNotifications((current) => ({ ...current, emailNewBookings: value }))} /></div>
          <div className="toggleRow"><span><strong>Daily summary</strong><small>Today's courts and bookings each morning</small></span><Switch checked={notifications.dailySummary} label="Daily summary" onChange={(value) => setNotifications((current) => ({ ...current, dailySummary: value }))} /></div>
          <div className="field">
            <span className="fieldLabel">Portal theme (this device)</span>
            <Segmented<Theme> label="Portal theme" onChange={(value) => { setTheme(value); applyTheme(value); }} options={[{ label: "System", value: "system" }, { label: "Light", value: "light" }, { label: "Dark", value: "dark" }]} value={theme} />
          </div>
        </section>
      </div>
    </>
  );
}
