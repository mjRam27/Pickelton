"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "./PartnerDatePicker.css";

type PartnerDatePickerProps = {
  ariaLabel: string;
  max?: string;
  min?: string;
  onChange: (value: string) => void;
  value: string;
};

type CalendarPosition = {
  left: number;
  top?: number;
  bottom?: number;
  width: number;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(value: string) {
  const date = parseDate(value);
  if (!date) return "Select date";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function PartnerDatePicker({
  ariaLabel,
  max,
  min,
  onChange,
  value,
}: PartnerDatePickerProps) {
  const generatedId = useId().replace(/:/g, "");
  const dialogId = `partner-date-picker-${generatedId}`;
  const selectedDate = parseDate(value);
  const todayValue = dateValue(new Date());
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    monthStart(selectedDate ?? new Date()),
  );
  const [position, setPosition] = useState<CalendarPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const firstWeekday = visibleMonth.getDay();
    const dayCount = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0,
    ).getDate();
    const cellCount = Math.ceil((firstWeekday + dayCount) / 7) * 7;
    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - firstWeekday + 1;
      if (day < 1 || day > dayCount) return null;
      return new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    });
  }, [visibleMonth]);

  function isAllowed(candidate: string) {
    return (!min || candidate >= min) && (!max || candidate <= max);
  }

  function canShowMonth(offset: number) {
    const candidate = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + offset,
      1,
    );
    const first = dateValue(candidate);
    const last = dateValue(
      new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0),
    );
    return (!min || last >= min) && (!max || first <= max);
  }

  function positionCalendar() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(304, window.innerWidth - 16);
    const estimatedHeight = 356;
    const gap = 7;
    const roomBelow = window.innerHeight - rect.bottom;
    const openAbove = roomBelow < estimatedHeight + gap && rect.top > roomBelow;
    setPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
      width,
      ...(openAbove
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  }

  function openCalendar() {
    setVisibleMonth(monthStart(selectedDate ?? new Date()));
    positionCalendar();
    setOpen(true);
  }

  function closeCalendar(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function choose(candidate: string) {
    if (!isAllowed(candidate)) return;
    onChange(candidate);
    closeCalendar(true);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) openCalendar();
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeCalendar(true);
    }
  }

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !calendarRef.current?.contains(target)
      ) {
        closeCalendar();
      }
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeCalendar(true);
    };
    const handleViewportChange = () => positionCalendar();
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const preferred = calendarRef.current?.querySelector<HTMLButtonElement>(
        '[data-selected="true"], [data-today="true"]',
      );
      preferred?.focus();
    });
  }, [open]);

  const calendarStyle = position as CSSProperties | null;

  return (
    <div ref={rootRef} className="partner-date-picker">
      <button
        ref={triggerRef}
        type="button"
        className="partner-date-picker__trigger"
        aria-controls={dialogId}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${ariaLabel}: ${displayDate(value)}`}
        onClick={() => (open ? closeCalendar() : openCalendar())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{displayDate(value)}</span>
        <CalendarDays size={17} aria-hidden="true" />
      </button>

      {open && calendarStyle && createPortal(
        <div
          ref={calendarRef}
          id={dialogId}
          className="partner-date-picker__calendar"
          role="dialog"
          aria-label={`${ariaLabel} calendar`}
          aria-modal="false"
          style={calendarStyle}
        >
          <header className="partner-date-picker__header">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canShowMonth(-1)}
              onClick={() =>
                setVisibleMonth((current) =>
                  new Date(current.getFullYear(), current.getMonth() - 1, 1),
                )
              }
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <strong aria-live="polite">{monthLabel(visibleMonth)}</strong>
            <button
              type="button"
              aria-label="Next month"
              disabled={!canShowMonth(1)}
              onClick={() =>
                setVisibleMonth((current) =>
                  new Date(current.getFullYear(), current.getMonth() + 1, 1),
                )
              }
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="partner-date-picker__weekdays" aria-hidden="true">
            {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
          </div>

          <div className="partner-date-picker__grid" role="grid">
            {days.map((date, index) => {
              if (!date) return <span key={`empty-${index}`} aria-hidden="true" />;
              const candidate = dateValue(date);
              const disabled = !isAllowed(candidate);
              return (
                <button
                  type="button"
                  role="gridcell"
                  key={candidate}
                  disabled={disabled}
                  aria-label={displayDate(candidate)}
                  aria-selected={candidate === value}
                  data-selected={candidate === value || undefined}
                  data-today={candidate === todayValue || undefined}
                  onClick={() => choose(candidate)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <footer className="partner-date-picker__footer">
            <button
              type="button"
              onClick={() => {
                onChange("");
                closeCalendar(true);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              disabled={!isAllowed(todayValue)}
              onClick={() => choose(todayValue)}
            >
              Today
            </button>
          </footer>
        </div>,
        document.body,
      )}
    </div>
  );
}
