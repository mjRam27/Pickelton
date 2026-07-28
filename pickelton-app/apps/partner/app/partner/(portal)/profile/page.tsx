import React, { useMemo } from "react";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  FileCheck2,
  FileText,
  Globe2,
  IndianRupee,
  Languages,
  LockKeyhole,
  LucideIcon,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

import "./page.css";

type ProfileValue = string | number | null;

interface PartnerProfile {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  totalCourts: number;
  operatingHours: string;
  businessCategory: ProfileValue;
  description: ProfileValue;
  website: ProfileValue;
  businessType: ProfileValue;
  registrationNumber: ProfileValue;
  taxId: ProfileValue;
  address: ProfileValue;
  state: ProfileValue;
  country: ProfileValue;
  postalCode: ProfileValue;
  language: ProfileValue;
  timeZone: ProfileValue;
  currency: ProfileValue;
}

interface MetricTileData {
  icon: LucideIcon;
  label: string;
  value: ProfileValue;
  href?: string;
}

interface StatusRowData {
  icon: LucideIcon;
  label: string;
  caption: string;
}

const partnerProfile: PartnerProfile = {
  businessName: "Pickelton Arena",
  ownerName: "Amrutha",
  email: "partner@pickelton.com",
  phone: "+91 9876543210",
  city: "Bangalore",
  totalCourts: 8,
  operatingHours: "6:00 AM – 11:00 PM",
  businessCategory: null,
  description: null,
  website: null,
  businessType: null,
  registrationNumber: null,
  taxId: null,
  address: null,
  state: null,
  country: null,
  postalCode: null,
  language: null,
  timeZone: null,
  currency: null,
};

const OPERATING_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

function SectionCard({
  title,
  description,
  icon: Icon,
  className = "",
  children,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`profile-card ${className}`.trim()}>
      <header className="card-heading">
        <span className="card-icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
  href,
}: MetricTileData) {
  const isMissing = value === null || value === "";

  const content = (
    <>
      <span className="contact-icon">
        <Icon size={16} aria-hidden="true" />
      </span>
      <span>
        <small>{label}</small>
        <strong className={isMissing ? "missing-value" : undefined}>
          {isMissing ? "Not provided" : value}
        </strong>
      </span>
    </>
  );

  return href && !isMissing ? (
    <a
      className="contact-item"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
  ) : (
    <div className="contact-item">{content}</div>
  );
}

function StatusRow({ icon: Icon, label, caption }: StatusRowData) {
  return (
    <div className="status-row">
      <div className="status-copy">
        <span className="status-icon">
          <Icon size={16} aria-hidden="true" />
        </span>
        <div>
          <strong>{label}</strong>
          <span>{caption}</span>
        </div>
      </div>
      <span className="status-chip status-neutral">Unavailable</span>
    </div>
  );
}

function InfoRow({
  label,
  value,
  href,
}: {
  label: string;
  value: ProfileValue;
  href?: string;
}) {
  const isMissing = value === null || value === "";

  return (
    <div className="info-row">
      <dt>{label}</dt>
      <dd className={isMissing ? "missing-value" : undefined}>
        {isMissing ? (
          "Not provided"
        ) : href ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export default function ProfilePage() {
  const {
    profileCompletion,
    completedCount,
    totalCount,
    missingFields,
  } = useMemo(() => {
    const fields = [
      { label: "Business name", value: partnerProfile.businessName },
      { label: "Owner name", value: partnerProfile.ownerName },
      { label: "Email address", value: partnerProfile.email },
      { label: "Phone number", value: partnerProfile.phone },
      {
        label: "Business category",
        value: partnerProfile.businessCategory,
      },
      {
        label: "Business description",
        value: partnerProfile.description,
      },
      { label: "Website", value: partnerProfile.website },
      {
        label: "Registration number",
        value: partnerProfile.registrationNumber,
      },
      { label: "Tax ID", value: partnerProfile.taxId },
      { label: "Street address", value: partnerProfile.address },
      { label: "City", value: partnerProfile.city },
      { label: "State", value: partnerProfile.state },
      { label: "Country", value: partnerProfile.country },
      { label: "Postal code", value: partnerProfile.postalCode },
    ];

    const completed = fields.filter(
      ({ value }) => value !== null && value !== "",
    ).length;

    return {
      completedCount: completed,
      totalCount: fields.length,
      profileCompletion: Math.round(
        (completed / fields.length) * 100,
      ),
      missingFields: fields
        .filter(({ value }) => value === null || value === "")
        .map(({ label }) => label),
    };
  }, []);

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "Asia/Kolkata",
      }).format(new Date()),
    [],
  );

  const businessInitials = useMemo(
    () =>
      partnerProfile.businessName
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join(""),
    [],
  );

  const statisticsData: MetricTileData[] = [
    {
      icon: Building2,
      value: partnerProfile.totalCourts,
      label: "Total Courts",
    },
    {
      icon: CalendarClock,
      value: null,
      label: "Total Bookings",
    },
    { icon: Users, value: null, label: "Customers" },
    { icon: IndianRupee, value: null, label: "Revenue" },
  ];

  const contactData: MetricTileData[] = [
    {
      icon: Mail,
      label: "Email Address",
      value: partnerProfile.email,
      href: `mailto:${partnerProfile.email}`,
    },
    {
      icon: Phone,
      label: "Phone Number",
      value: partnerProfile.phone,
      href: `tel:${partnerProfile.phone.replace(/\s/g, "")}`,
    },
    {
      icon: Globe2,
      label: "Website",
      value: partnerProfile.website,
    },
    {
      icon: MapPin,
      label: "Primary City",
      value: partnerProfile.city,
    },
  ];

  const preferenceData: MetricTileData[] = [
    {
      icon: Languages,
      label: "Language",
      value: partnerProfile.language,
    },
    {
      icon: Clock3,
      label: "Time Zone",
      value: partnerProfile.timeZone,
    },
    {
      icon: WalletCards,
      label: "Currency",
      value: partnerProfile.currency,
    },
    {
      icon: Bell,
      label: "Notifications",
      value: null,
    },
  ];

  return (
    <div className="profile-page">
      <div className="profile-row profile-overview-row">
        <section className="profile-card business-profile-card">
          <div className="hero-top-bar">
            <span className="business-label">BUSINESS PROFILE</span>
            <button className="edit-profile-btn" type="button">
              <CircleUserRound size={16} aria-hidden="true" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="business-identity-wrapper">
            <div
              className="business-logo"
              aria-label={`${partnerProfile.businessName} initials`}
            >
              {businessInitials}
            </div>

            <div className="business-copy">
              <h1 className="hero-heading">
                {partnerProfile.businessName}
              </h1>

              <div className="business-badges">
                <span className="role-chip">
                  <BriefcaseBusiness size={13} aria-hidden="true" />
                  Partner
                </span>
                <span
                  className={`category-chip ${
                    !partnerProfile.businessCategory
                      ? "category-missing"
                      : ""
                  }`}
                >
                  {partnerProfile.businessCategory ??
                    "Category not provided"}
                </span>
              </div>

              <p className="hero-subtext">
                {partnerProfile.description ??
                  "Add a short description to help customers understand your venue and complete your business profile."}
              </p>
            </div>
          </div>

          <div className="business-summary">
            <div className="summary-item">
              <span className="summary-icon">
                <MapPin size={16} aria-hidden="true" />
              </span>
              <div>
                <small>Location</small>
                <strong>{partnerProfile.city}</strong>
              </div>
            </div>

            <div className="summary-item">
              <span className="summary-icon">
                <Clock3 size={16} aria-hidden="true" />
              </span>
              <div>
                <small>Operating Hours</small>
                <strong>{partnerProfile.operatingHours}</strong>
              </div>
            </div>

            <div className="summary-item">
              <span className="summary-icon">
                <Building2 size={16} aria-hidden="true" />
              </span>
              <div>
                <small>Venue Size</small>
                <strong>{partnerProfile.totalCourts} Courts</strong>
              </div>
            </div>
          </div>
        </section>

        <SectionCard
          title="Profile Statistics"
          description="Available business metrics and profile readiness."
          icon={Building2}
          className="profile-statistics-card"
        >
          <div className="statistics-grid">
            {statisticsData.map((stat) => {
              const Icon = stat.icon;

              return (
                <article className="stat-item" key={stat.label}>
                  <span className="stat-icon">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>
                      {stat.value === null || stat.value === ""
                        ? "—"
                        : stat.value}
                    </strong>
                    <span>{stat.label}</span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="completion-block">
            <div className="completion-heading">
              <div>
                <span>Profile Completion</span>
                <small>
                  {completedCount} of {totalCount} fields
                </small>
              </div>
              <strong>{profileCompletion}%</strong>
            </div>

            <div
              className="completion-track"
              role="progressbar"
              aria-label="Profile completion percentage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={profileCompletion}
            >
              <span style={{ width: `${profileCompletion}%` }} />
            </div>

            {missingFields.length > 0 && (
              <div className="completion-next">
                <CheckCircle2 size={14} aria-hidden="true" />
                Add {missingFields[0].toLowerCase()} next
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="profile-row profile-contact-row">
        <SectionCard
          title="Contact Information"
          description="Business contact details and online presence."
          icon={Mail}
        >
          <div className="contact-grid">
            {contactData.map((item) => (
              <DetailTile key={item.label} {...item} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Account Preferences"
          description="Regional and communication preferences."
          icon={Globe2}
        >
          <div className="preference-grid">
            {preferenceData.map((item) => (
              <DetailTile key={item.label} {...item} />
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="profile-row profile-business-row">
        <SectionCard
          title="Business Information"
          description="Registered business and ownership details."
          icon={BriefcaseBusiness}
        >
          <dl className="info-list information-columns">
            <InfoRow
              label="Business Name"
              value={partnerProfile.businessName}
            />
            <InfoRow
              label="Owner Name"
              value={partnerProfile.ownerName}
            />
            <InfoRow
              label="Business Type"
              value={partnerProfile.businessType}
            />
            <InfoRow
              label="Business Category"
              value={partnerProfile.businessCategory}
            />
            <InfoRow
              label="Registration Number"
              value={partnerProfile.registrationNumber}
            />
            <InfoRow
              label="GST / Tax ID"
              value={partnerProfile.taxId}
            />
          </dl>
        </SectionCard>

        <SectionCard
          title="Operating Hours"
          description="Standard weekly venue availability."
          icon={Clock3}
        >
          <div className="hours-list">
            {OPERATING_DAYS.map((day) => {
              const isToday = day === today;

              return (
                <div
                  className={`hours-row ${
                    isToday ? "is-today" : ""
                  }`}
                  key={day}
                >
                  <div className="hours-day">
                    <strong>{day}</strong>
                    {isToday && (
                      <span className="today-chip">Today</span>
                    )}
                  </div>
                  <span className="hours-time">
                    {partnerProfile.operatingHours}
                  </span>
                  <span className="status-chip status-open">
                    <span aria-hidden="true" />
                    Open
                  </span>
                </div>
              );
            })}
          </div>

          <div className="special-hours">
            <div>
              <strong>Special Hours</strong>
              <span>Holiday or event-specific hours</span>
            </div>
            <span className="missing-value">Not provided</span>
          </div>
        </SectionCard>
      </div>

      <div className="profile-row profile-account-row">
        <SectionCard
          title="Verification & Documents"
          description="Business compliance and document status."
          icon={FileCheck2}
        >
          <div className="status-list">
            <StatusRow
              icon={ShieldCheck}
              label="Business Verification"
              caption="Verification data unavailable"
            />
            <StatusRow
              icon={FileText}
              label="Business License"
              caption="No document data provided"
            />
            <StatusRow
              icon={IndianRupee}
              label="Tax Verification"
              caption="No tax status provided"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Security & Account Status"
          description="Current account access and security information."
          icon={ShieldCheck}
        >
          <div className="status-list">
            <StatusRow
              icon={Mail}
              label="Email Verification"
              caption={partnerProfile.email}
            />
            <StatusRow
              icon={Phone}
              label="Phone Verification"
              caption={partnerProfile.phone}
            />
            <StatusRow
              icon={LockKeyhole}
              label="Two-Factor Authentication"
              caption="Security status not provided"
            />
            <StatusRow
              icon={Clock3}
              label="Last Login"
              caption="No login history available"
            />
          </div>
        </SectionCard>
      </div>

      <div className="profile-row profile-final-row">
        <SectionCard
          title="Venue Information"
          description="Primary location associated with your business."
          icon={MapPin}
        >
          <dl className="info-list venue-columns">
            <InfoRow
              label="Address"
              value={partnerProfile.address}
            />
            <InfoRow label="City" value={partnerProfile.city} />
            <InfoRow label="State" value={partnerProfile.state} />
            <InfoRow
              label="Country"
              value={partnerProfile.country}
            />
            <InfoRow
              label="Postal Code"
              value={partnerProfile.postalCode}
            />
          </dl>

          {!partnerProfile.address && (
            <div className="inline-notice">
              <MapPin size={16} aria-hidden="true" />
              Add a complete address to enable location and map
              details.
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent Activity"
          description="Updates related to this business profile."
          icon={FileText}
          className="activity-card"
        >
          <div className="profile-empty-state">
            <span className="empty-state-icon" aria-hidden="true">
              <LockKeyhole size={20} />
            </span>
            <div>
              <h3>No recent activity</h3>
              <p>
                Profile and account activity will appear here when
                activity data is available.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}