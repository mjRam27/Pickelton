// partner/components/ui.tsx
"use client";

import type { ReactNode } from "react";
import type { BookingStatus, CourtSport } from "@pickelton/types";
import { initials } from "../lib/partner";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 112 112" width={size}>
      <circle cx="54" cy="48" fill="#C8F03C" r="34" />
      <g fill="#0C100E">
        <circle cx="42" cy="34" r="4" /><circle cx="60" cy="30" r="4" /><circle cx="70" cy="48" r="4" />
        <circle cx="58" cy="64" r="4" /><circle cx="40" cy="56" r="4" /><circle cx="54" cy="47" r="3.2" />
      </g>
      <path d="M4 34h12M0 48h12M6 62h10" stroke="#C8F03C" strokeLinecap="round" strokeWidth="5" />
    </svg>
  );
}

export function PageHeader({ title, sub, crumbs, children }: { title: ReactNode; sub?: ReactNode; crumbs?: ReactNode; children?: ReactNode }) {
  return (
    <header className="pageHeader">
      <div className="headStack">
        {crumbs ? <nav aria-label="Breadcrumb" className="crumbs">{crumbs}</nav> : null}
        <h1 className="display">{title}</h1>
        {sub ? <span className="sub">{sub}</span> : null}
      </div>
      {children ? <div className="row">{children}</div> : null}
    </header>
  );
}

export function Notice({ message, tone = "error" }: { message?: string | null; tone?: "error" | "success" }) {
  if (!message) return null;
  return <div className={tone === "success" ? "notice success" : "notice"} role={tone === "error" ? "alert" : "status"}>{message}</div>;
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return <div aria-live="polite" className="loading"><span className="spinner" />{label}</div>;
}

export function Empty({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return <div className="empty"><h3>{title}</h3><p>{copy}</p>{action}</div>;
}

// Error with retry, used when a page's main request fails.
export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Empty action={<button className="btn" onClick={onRetry} type="button">Try again</button>} copy={message} title="Couldn't load this page" />;
}

export function Avatar({ name, tone, square = false }: { name?: string | null; tone?: "acc" | "blu" | "hot"; square?: boolean }) {
  return <span aria-hidden="true" className={["avatar", tone, square && "square"].filter(Boolean).join(" ")}>{initials(name)}</span>;
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean }) {
  return <button aria-checked={checked} aria-label={label} className="switch" disabled={disabled} onClick={() => onChange(!checked)} role="switch" type="button" />;
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: Array<{ value: T; label: string }>; value: T; onChange: (value: T) => void; label: string }) {
  return (
    <div aria-label={label} className="segmented" role="group">
      {options.map((option) => <button aria-pressed={option.value === value} key={option.value} onClick={() => onChange(option.value)} type="button">{option.label}</button>)}
    </div>
  );
}

const STATUS: Record<BookingStatus, { label: string; tone: string }> = {
  PENDING: { label: "Pending", tone: "plain" },
  CONFIRMED: { label: "Confirmed", tone: "blu" },
  COMPLETED: { label: "Completed", tone: "acc" },
  CANCELLED: { label: "Cancelled", tone: "hot" },
  REJECTED: { label: "Rejected", tone: "hot" },
};

export function BookingBadge({ status }: { status: BookingStatus }) {
  const look = STATUS[status] ?? { label: status, tone: "plain" };
  return <span className={`badge ${look.tone}`}>{look.label}</span>;
}

export const sportLabel = (sport: CourtSport) => (sport === "BADMINTON" ? "Badminton" : sport === "MULTI_SPORT" ? "Multi-sport" : "Pickleball");
export const sportTone = (sport: CourtSport) => (sport === "BADMINTON" ? "blu" : sport === "MULTI_SPORT" ? "hot" : "acc");
