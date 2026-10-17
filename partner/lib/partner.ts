// partner/lib/partner.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPartnerApi } from "@pickelton/api";
import type { ApiError, Money } from "@pickelton/types";
import { formatCurrency } from "@pickelton/utils";

const TOKEN_KEY = "pickelton.partner.token";
const baseUrl = process.env.NEXT_PUBLIC_PARTNER_API_URL ?? "http://localhost:8090/api/v1";

// Storage can throw in private windows; treat that as "signed out".
function stores(): Storage[] {
  try {
    return [window.localStorage, window.sessionStorage];
  } catch {
    return [];
  }
}

export function getToken() {
  for (const store of stores()) {
    const token = store.getItem(TOKEN_KEY);
    if (token) return token;
  }
  return null;
}

// "Keep me signed in" uses localStorage; otherwise the session ends with the tab.
export function saveSession(token: string, remember: boolean) {
  clearSession();
  const [local, session] = stores();
  (remember ? local : session)?.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  for (const store of stores()) store.removeItem(TOKEN_KEY);
}

export const partnerApi = createPartnerApi(baseUrl, getToken);

export function isUnauthorized(error: unknown) {
  return (error as ApiError | undefined)?.status === 401;
}

export function errorMessage(error: unknown) {
  const apiError = error as ApiError | undefined;
  if (apiError?.error?.message) return apiError.error.message;
  if (apiError?.message === "Failed to fetch") return "Can't reach the Pickelton partner service. Check your connection and try again.";
  return apiError?.message ?? "Something went wrong. Please try again.";
}

export const toNumber = (value: Money | null | undefined) => Number(value ?? 0) || 0;
export const money = (value: Money | null | undefined) => formatCurrency(toNumber(value));

export function initials(name?: string | null) {
  return (name ?? "").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "PT";
}

export function formatDate(value: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", weekday: "short" }) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "–" : date.toLocaleDateString("en-IN", options).replace(",", "");
}

export function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "–" : date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// Loads data for a page and sends the user back to log in when the session has expired.
export function useResource<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await run());
    } catch (cause) {
      if (isUnauthorized(cause)) {
        clearSession();
        router.replace("/partner/login");
        return;
      }
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [run, router]);

  useEffect(() => { void reload(); }, [reload]);
  return { data, setData, error, loading, reload };
}
