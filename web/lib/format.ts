// web/lib/format.ts
import type { SportType } from "@pickelton/types";

export function initials(name?: string | null) {
  return (name ?? "").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "PL";
}

// Stable colour per person so the same player keeps the same avatar everywhere.
export function toneFor(seed: string): "acc" | "blu" | "hot" | "" {
  const tones = ["acc", "blu", "hot", ""] as const;
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return tones[Math.abs(hash) % tones.length];
}

export function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function timeAgo(value: string) {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (!Number.isFinite(minutes)) return "";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h`;
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export const sportLabel = (sport: SportType) => (sport === "BADMINTON" ? "Badminton" : sport === "BOTH" ? "Pickleball & badminton" : "Pickleball");
export const sportInk = (sport: SportType) => (sport === "BADMINTON" ? "var(--blu-ink)" : "var(--acc-ink)");
export const titleCase = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
