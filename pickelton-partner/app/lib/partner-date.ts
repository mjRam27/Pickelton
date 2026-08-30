const PARTNER_TIME_ZONE = "Asia/Kolkata";
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_WITHOUT_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;

export type PartnerDateValue = Date | number | string | null | undefined;

function parsePartnerDate(value: PartnerDateValue): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  let normalized = value;
  if (typeof value === "string") {
    if (DATE_ONLY.test(value)) normalized = `${value}T12:00:00+05:30`;
    else if (DATE_TIME_WITHOUT_ZONE.test(value)) normalized = `${value}+05:30`;
  }

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parts(value: PartnerDateValue, options: Intl.DateTimeFormatOptions) {
  const date = parsePartnerDate(value);
  if (!date) return null;
  const values = new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: PARTNER_TIME_ZONE,
  }).formatToParts(date);
  return Object.fromEntries(values.map((part) => [part.type, part.value]));
}

export function formatPartnerDate(value: PartnerDateValue): string {
  const valueParts = parts(value, { day: "2-digit", month: "short", year: "numeric" });
  return valueParts ? `${valueParts.day} ${valueParts.month} ${valueParts.year}` : "—";
}

export function formatPartnerTime(value: PartnerDateValue): string {
  const valueParts = parts(value, { hour: "numeric", minute: "2-digit", hour12: true });
  return valueParts
    ? `${valueParts.hour}:${valueParts.minute} ${valueParts.dayPeriod.toUpperCase()}`
    : "—";
}

export function formatPartnerDateTime(value: PartnerDateValue): string {
  const date = formatPartnerDate(value);
  const time = formatPartnerTime(value);
  return date === "—" || time === "—" ? "—" : `${date}, ${time}`;
}

export function formatPartnerTimeRange(start: PartnerDateValue, end: PartnerDateValue): string {
  const startTime = formatPartnerTime(start);
  const endTime = formatPartnerTime(end);
  return startTime === "—" || endTime === "—" ? "—" : `${startTime} – ${endTime}`;
}

export function formatPartnerMonth(value: PartnerDateValue): string {
  const valueParts = parts(value, { month: "short", year: "numeric" });
  return valueParts ? `${valueParts.month} ${valueParts.year}` : "—";
}

export function formatPartnerYear(value: PartnerDateValue): string {
  const valueParts = parts(value, { year: "numeric" });
  return valueParts?.year ?? "—";
}

export function formatPartnerDayMonth(value: PartnerDateValue): string {
  const valueParts = parts(value, { day: "2-digit", month: "short" });
  return valueParts ? `${valueParts.day} ${valueParts.month}` : "—";
}

export function formatPartnerWeekday(value: PartnerDateValue): string {
  const valueParts = parts(value, { weekday: "short" });
  return valueParts?.weekday ?? "—";
}

export { PARTNER_TIME_ZONE };
