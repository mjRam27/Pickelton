// web/components/ui.tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { initials } from "../lib/format";

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

export function Spinner() {
  return <span aria-hidden="true" className="spinner" />;
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return <div aria-live="polite" className="loadingBox"><Spinner />{label}</div>;
}

export function Empty({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return <div className="empty"><h3>{title}</h3><p>{copy}</p>{action}</div>;
}

// A failed main request: explain and offer a retry.
export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Empty action={<button className="btn" onClick={onRetry} type="button">Try again</button>} copy={message} title="Couldn't load this" />;
}

export function Avatar({ name, tone = "", size = 40, square = false }: { name?: string | null; tone?: string; size?: number; square?: boolean }) {
  return (
    <span aria-hidden="true" className={["avatar", tone, square && "square"].filter(Boolean).join(" ")} style={{ fontSize: Math.round(size * (square ? 0.42 : 0.34)), height: size, width: size }}>
      {initials(name)}
    </span>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label, full = false }: {
  options: Array<{ value: T; label: string }>; value: T; onChange: (value: T) => void; label: string; full?: boolean;
}) {
  return (
    <div aria-label={label} className={full ? "segmented full" : "segmented"} role="group">
      {options.map((option) => <button aria-pressed={option.value === value} key={option.value} onClick={() => onChange(option.value)} type="button">{option.label}</button>)}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)} role="switch" type="button" />;
}

export function DateBlock({ date, color }: { date: string; color: string }) {
  const parsed = new Date(date);
  const valid = !Number.isNaN(parsed.getTime());
  return (
    <span aria-hidden="true" className="dateBlock">
      <span style={{ color }}>{valid ? parsed.toLocaleDateString("en-IN", { month: "short" }) : "TBA"}</span>
      <strong>{valid ? String(parsed.getDate()).padStart(2, "0") : "--"}</strong>
    </span>
  );
}

// Accessible confirm dialog: focuses the confirm button, closes on Escape.
export function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onCancel }: {
  open: boolean; title: string; body: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="dialogBackdrop" onClick={onCancel}>
      <div aria-labelledby="dialog-title" aria-modal="true" className="dialog" onClick={(event) => event.stopPropagation()} role="dialog">
        <h2 id="dialog-title">{title}</h2>
        <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>{body}</p>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={onCancel} type="button">Cancel</button>
          <button className="btn primary" onClick={onConfirm} ref={confirmRef} type="button">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// Copies a link when the browser has no native share sheet (most desktop browsers).
export async function shareOrCopy(text: string, url = window.location.href) {
  if (navigator.share) {
    try {
      await navigator.share({ text, url });
      return "";
    } catch {
      return "";
    }
  }
  await navigator.clipboard.writeText(url).catch(() => undefined);
  return "Link copied to clipboard.";
}
