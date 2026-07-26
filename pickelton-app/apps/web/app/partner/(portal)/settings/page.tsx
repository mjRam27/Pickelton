"use client";

import React, { FormEvent, ReactNode, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Eye,
  Globe2,
  Link2,
  LockKeyhole,
  Mail,
  Paintbrush,
  Save,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  SlidersHorizontal,
} from "lucide-react";
import "./page.css";

type SettingsState = {
  businessName: string;
  language: string;
  timeZone: string;
  currency: string;
  dateFormat: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingAlerts: boolean;
  paymentAlerts: boolean;
  marketingNotifications: boolean;
  openingTime: string;
  closingTime: string;
  autoConfirmation: boolean;
  bookingWindow: string;
  cancellationPolicy: string;
  slotDuration: string;
  bufferTime: string;
  basePrice: string;
  invoiceEmails: boolean;
};

const initialSettings: SettingsState = {
  businessName: "",
  language: "",
  timeZone: "",
  currency: "",
  dateFormat: "",
  emailNotifications: true,
  smsNotifications: false,
  bookingAlerts: true,
  paymentAlerts: true,
  marketingNotifications: false,
  openingTime: "06:00",
  closingTime: "23:00",
  autoConfirmation: false,
  bookingWindow: "",
  cancellationPolicy: "",
  slotDuration: "",
  bufferTime: "",
  basePrice: "500",
  invoiceEmails: false,
};

type SettingsCardProps = {
  id?: string;
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  danger?: boolean;
  className?: string;
};

function SettingsCard({
  id,
  icon,
  title,
  description,
  children,
  danger = false,
  className = "",
}: SettingsCardProps) {
  return (
    <section
      id={id}
      className={`settings-card ${danger ? "danger-card" : ""} ${className}`}
    >
      <header className="settings-card-header">
        <span className="settings-card-icon" aria-hidden="true">
          {icon}
        </span>

        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>

      <div className="settings-card-body">{children}</div>
    </section>
  );
}

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      className={`toggle-control ${checked ? "is-active" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

type PreferenceRowProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function PreferenceRow({
  icon,
  title,
  description,
  children,
}: PreferenceRowProps) {
  return (
    <div className="preference-row">
      <span className="preference-icon" aria-hidden="true">
        {icon}
      </span>

      <div className="preference-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <div className="preference-action">{children}</div>
    </div>
  );
}

function StatusChip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  return (
    <span className={`status-chip status-${tone}`}>
      <span aria-hidden="true" />
      {children}
    </span>
  );
}

function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="empty-panel">
      <span className="empty-panel-icon" aria-hidden="true">
        {icon}
      </span>

      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [savedSettings, setSavedSettings] = useState<SettingsState>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  function updateSetting<Key extends keyof SettingsState>(
    key: Key,
    value: SettingsState[Key]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasUnsavedChanges || isSaving) {
      return;
    }

    setIsSaving(true);
    setSavedSettings(settings);
    setIsSaving(false);
  }

  function handleDiscard() {
    setSettings(savedSettings);
  }

  return (
    <form className="settings-page" onSubmit={handleSubmit}>
      <div className="settings-page-header">
        <section className="settings-hero">
          <span className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <span className="hero-orbit hero-orbit-two" aria-hidden="true" />

          <div className="settings-hero-copy">
            <span className="settings-eyebrow">PARTNER SETTINGS</span>
            <h1>Business Settings</h1>
            <p>
              Manage your venue, booking, payment and account preferences.
            </p>
          </div>
        </section>

        <button
          type="submit"
          className="primary-action"
          disabled={!hasUnsavedChanges || isSaving}
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <nav className="settings-nav" aria-label="Settings navigation">
        <a href="#general">
          <Globe2 size={16} aria-hidden="true" />
          General
        </a>
        <a href="#notifications">
          <Bell size={16} aria-hidden="true" />
          Notifications
        </a>
        <a href="#business">
          <Building2 size={16} aria-hidden="true" />
          Business
        </a>
        <a href="#booking">
          <CalendarClock size={16} aria-hidden="true" />
          Bookings
        </a>
        <a href="#payments">
          <CreditCard size={16} aria-hidden="true" />
          Payments
        </a>
        <a href="#security">
          <ShieldCheck size={16} aria-hidden="true" />
          Security
        </a>
      </nav>

      <div className="settings-row settings-row-general">
        <SettingsCard
          id="general"
          icon={<Globe2 size={20} />}
          title="General Settings"
          description="Business identity and regional preferences."
        >
          <div className="general-layout">
            <label className="form-field business-field">
              <span>Business Name</span>
              <input
                type="text"
                value={settings.businessName}
                onChange={(event) =>
                  updateSetting("businessName", event.target.value)
                }
                placeholder="Not Configured"
              />
              <small>Enter the public name used for your venue.</small>
            </label>

            <div className="quick-settings-grid">
              <label className="quick-setting">
                <span className="quick-setting-icon">
                  <Globe2 size={17} aria-hidden="true" />
                </span>
                <span className="quick-setting-content">
                  <span>Language</span>
                  <select
                    value={settings.language}
                    onChange={(event) =>
                      updateSetting("language", event.target.value)
                    }
                    aria-label="Language"
                  >
                    <option value="">Not Configured</option>
                    <option value="English">English</option>
                  </select>
                </span>
              </label>

              <label className="quick-setting">
                <span className="quick-setting-icon">
                  <Clock3 size={17} aria-hidden="true" />
                </span>
                <span className="quick-setting-content">
                  <span>Time Zone</span>
                  <select
                    value={settings.timeZone}
                    onChange={(event) =>
                      updateSetting("timeZone", event.target.value)
                    }
                    aria-label="Time zone"
                  >
                    <option value="">Not Configured</option>
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                  </select>
                </span>
              </label>

              <label className="quick-setting">
                <span className="quick-setting-icon">
                  <CircleDollarSign size={17} aria-hidden="true" />
                </span>
                <span className="quick-setting-content">
                  <span>Currency</span>
                  <select
                    value={settings.currency}
                    onChange={(event) =>
                      updateSetting("currency", event.target.value)
                    }
                    aria-label="Currency"
                  >
                    <option value="">Not Configured</option>
                    <option value="INR">INR — Indian Rupee</option>
                  </select>
                </span>
              </label>

              <label className="quick-setting">
                <span className="quick-setting-icon">
                  <CalendarClock size={17} aria-hidden="true" />
                </span>
                <span className="quick-setting-content">
                  <span>Date Format</span>
                  <select
                    value={settings.dateFormat}
                    onChange={(event) =>
                      updateSetting("dateFormat", event.target.value)
                    }
                    aria-label="Date format"
                  >
                    <option value="">Not Configured</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </span>
              </label>
            </div>
          </div>
        </SettingsCard>
      </div>

      <div className="settings-row">
        <SettingsCard
          id="notifications"
          icon={<Bell size={20} />}
          title="Notifications"
          description="Choose how operational updates reach you."
        >
          <div className="preference-list">
            <PreferenceRow
              icon={<Mail size={17} />}
              title="Email Notifications"
              description="Receive partner account updates by email."
            >
              <Toggle
                checked={settings.emailNotifications}
                onChange={(value) =>
                  updateSetting("emailNotifications", value)
                }
                label="Email notifications"
              />
            </PreferenceRow>

            <PreferenceRow
              icon={<Smartphone size={17} />}
              title="SMS Notifications"
              description="Receive time-sensitive alerts by SMS."
            >
              <Toggle
                checked={settings.smsNotifications}
                onChange={(value) =>
                  updateSetting("smsNotifications", value)
                }
                label="SMS notifications"
              />
            </PreferenceRow>

            <PreferenceRow
              icon={<CalendarClock size={17} />}
              title="Booking Alerts"
              description="Get notified about booking changes."
            >
              <Toggle
                checked={settings.bookingAlerts}
                onChange={(value) =>
                  updateSetting("bookingAlerts", value)
                }
                label="Booking alerts"
              />
            </PreferenceRow>

            <PreferenceRow
              icon={<CreditCard size={17} />}
              title="Payment Alerts"
              description="Receive payment and refund updates."
            >
              <Toggle
                checked={settings.paymentAlerts}
                onChange={(value) =>
                  updateSetting("paymentAlerts", value)
                }
                label="Payment alerts"
              />
            </PreferenceRow>

            <PreferenceRow
              icon={<Bell size={17} />}
              title="Marketing Notifications"
              description="Receive campaign and product updates."
            >
              <Toggle
                checked={settings.marketingNotifications}
                onChange={(value) =>
                  updateSetting("marketingNotifications", value)
                }
                label="Marketing notifications"
              />
            </PreferenceRow>
          </div>
        </SettingsCard>

        <SettingsCard
          id="security"
          icon={<ShieldCheck size={20} />}
          title="Security"
          description="Review account access and protection."
        >
          <div className="preference-list">
            <PreferenceRow
              icon={<LockKeyhole size={17} />}
              title="Password"
              description="Update your partner account password."
            >
              <button type="button" className="row-action">
                Change
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </PreferenceRow>

            <PreferenceRow
              icon={<ShieldCheck size={17} />}
              title="Two-Factor Authentication"
              description="Add another layer of account protection."
            >
              <StatusChip>Not Configured</StatusChip>
            </PreferenceRow>

            <PreferenceRow
              icon={<Eye size={17} />}
              title="Active Sessions"
              description="Review devices signed into this account."
            >
              <StatusChip>Not Configured</StatusChip>
            </PreferenceRow>

            <PreferenceRow
              icon={<Clock3 size={17} />}
              title="Login History"
              description="Review recent account sign-in activity."
            >
              <StatusChip>Not Configured</StatusChip>
            </PreferenceRow>
          </div>
        </SettingsCard>
      </div>

      <div className="settings-row">
        <SettingsCard
          id="business"
          icon={<Building2 size={20} />}
          title="Business Preferences"
          description="Operating hours and venue defaults."
        >
          <div className="time-fields">
            <label className="form-field">
              <span>Opening Time</span>
              <input
                type="time"
                value={settings.openingTime}
                onChange={(event) =>
                  updateSetting("openingTime", event.target.value)
                }
              />
            </label>

            <label className="form-field">
              <span>Closing Time</span>
              <input
                type="time"
                value={settings.closingTime}
                onChange={(event) =>
                  updateSetting("closingTime", event.target.value)
                }
              />
            </label>
          </div>

          <div className="shortcut-list">
            <button type="button" className="shortcut-item">
              <span className="preference-icon">
                <CalendarClock size={17} aria-hidden="true" />
              </span>
              <span>
                <strong>Operating Hours</strong>
                <small>Review the weekly business schedule</small>
              </span>
              <ChevronRight size={17} aria-hidden="true" />
            </button>

            <button type="button" className="shortcut-item">
              <span className="preference-icon">
                <Clock3 size={17} aria-hidden="true" />
              </span>
              <span>
                <strong>Holiday Management</strong>
                <small>No holiday schedule configured</small>
              </span>
              <ChevronRight size={17} aria-hidden="true" />
            </button>

            <button type="button" className="shortcut-item">
              <span className="preference-icon">
                <SlidersHorizontal size={17} aria-hidden="true" />
              </span>
              <span>
                <strong>Availability Defaults</strong>
                <small>Manage defaults from the Courts workspace</small>
              </span>
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        </SettingsCard>

        <SettingsCard
          id="booking"
          icon={<CalendarClock size={20} />}
          title="Booking Preferences"
          description="Configure reservations and court pricing."
        >
          <PreferenceRow
            icon={<Check size={17} />}
            title="Automatic Confirmation"
            description="Confirm eligible bookings automatically."
          >
            <Toggle
              checked={settings.autoConfirmation}
              onChange={(value) =>
                updateSetting("autoConfirmation", value)
              }
              label="Automatic booking confirmation"
            />
          </PreferenceRow>

          <div className="booking-fields">
            <label className="form-field">
              <span>Base Price / Hour</span>
              <div className="currency-input">
                <span>₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={settings.basePrice}
                  onChange={(event) =>
                    updateSetting("basePrice", event.target.value)
                  }
                />
              </div>
            </label>

            <label className="form-field">
              <span>Booking Window</span>
              <select
                value={settings.bookingWindow}
                onChange={(event) =>
                  updateSetting("bookingWindow", event.target.value)
                }
              >
                <option value="">Not Configured</option>
                <option value="7 days">7 days</option>
                <option value="14 days">14 days</option>
                <option value="30 days">30 days</option>
              </select>
            </label>

            <label className="form-field">
              <span>Slot Duration</span>
              <select
                value={settings.slotDuration}
                onChange={(event) =>
                  updateSetting("slotDuration", event.target.value)
                }
              >
                <option value="">Not Configured</option>
                <option value="30 minutes">30 minutes</option>
                <option value="60 minutes">60 minutes</option>
                <option value="90 minutes">90 minutes</option>
              </select>
            </label>

            <label className="form-field">
              <span>Buffer Time</span>
              <select
                value={settings.bufferTime}
                onChange={(event) =>
                  updateSetting("bufferTime", event.target.value)
                }
              >
                <option value="">Not Configured</option>
                <option value="0 minutes">No buffer</option>
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
              </select>
            </label>

            <label className="form-field full-field">
              <span>Cancellation Policy</span>
              <select
                value={settings.cancellationPolicy}
                onChange={(event) =>
                  updateSetting("cancellationPolicy", event.target.value)
                }
              >
                <option value="">Not Configured</option>
                <option value="Flexible">Flexible</option>
                <option value="Moderate">Moderate</option>
                <option value="Strict">Strict</option>
              </select>
            </label>
          </div>
        </SettingsCard>
      </div>

      <div className="settings-row">
        <SettingsCard
          id="payments"
          icon={<CreditCard size={20} />}
          title="Payment Settings"
          description="Payment, tax and invoice preferences."
        >
          <div className="summary-list">
            <div className="summary-item">
              <span>Payment Status</span>
              <StatusChip>Not Configured</StatusChip>
            </div>
            <div className="summary-item">
              <span>Supported Payment Methods</span>
              <strong>Not Configured</strong>
            </div>
            <div className="summary-item">
              <span>Tax Settings</span>
              <strong>Not Configured</strong>
            </div>
            <div className="summary-item">
              <span>Invoice Preferences</span>
              <strong>Not Configured</strong>
            </div>
          </div>

          <PreferenceRow
            icon={<Mail size={17} />}
            title="Invoice Emails"
            description="Email invoices when generation becomes available."
          >
            <Toggle
              checked={settings.invoiceEmails}
              onChange={(value) =>
                updateSetting("invoiceEmails", value)
              }
              label="Invoice emails"
            />
          </PreferenceRow>
        </SettingsCard>

        <SettingsCard
          id="connections"
          icon={<Link2 size={20} />}
          title="Connected Services"
          description="External services linked to your account."
        >
          <EmptyPanel
            icon={<Link2 size={20} />}
            title="No connected services"
            description="No calendar, payment gateway, email provider or other supported integration is currently configured."
          />
        </SettingsCard>
      </div>

      <div className="settings-row settings-row-final">
        <SettingsCard
          id="appearance"
          icon={<Paintbrush size={20} />}
          title="Appearance"
          description="Supported display and interface preferences."
        >
          <EmptyPanel
            icon={<Paintbrush size={20} />}
            title="Appearance is managed by Pickelton"
            description="No theme or display preference controls are available in the current implementation."
          />
        </SettingsCard>

        <SettingsCard
          id="danger"
          icon={<ShieldAlert size={20} />}
          title="Danger Zone"
          description="Irreversible business and account actions."
          danger
        >
          <EmptyPanel
            icon={<ShieldAlert size={20} />}
            title="No account actions available"
            description="Business deactivation and account deletion are not supported by the current implementation."
          />
        </SettingsCard>
      </div>

      {hasUnsavedChanges && (
        <footer className="save-footer">
          <div>
            <strong>Unsaved changes</strong>
            <span>Your updated preferences have not been saved.</span>
          </div>

          <div className="save-footer-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={handleDiscard}
            >
              Discard
            </button>

            <button
              type="submit"
              className="primary-action"
              disabled={isSaving}
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </footer>
      )}
    </form>
  );
}