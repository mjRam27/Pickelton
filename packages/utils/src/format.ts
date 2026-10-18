// pickelton-app/packages/utils/src/format.ts
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatSportName(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

// "2026-11-07T09:00:00" -> "Sat 7 Nov"
export function formatShortDate(value: string | null | undefined): string {
  if (!value) return "Date TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date TBA";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" }).replace(",", "");
}
