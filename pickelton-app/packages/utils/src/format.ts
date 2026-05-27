// pickelton-app/packages/utils/src/format.ts
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
}

export function formatSportName(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
