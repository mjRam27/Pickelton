// web/lib/session.ts
"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPickeltonApi, apiErrorMessage } from "@pickelton/api";
import type { ApiError, AuthResponse } from "@pickelton/types";

const SESSION_KEY = "pickelton.session";
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type Session = Pick<AuthResponse, "token" | "refreshToken" | "userId" | "name" | "email" | "phoneNumber" | "dateOfBirth" | "emailVerified" | "phoneVerified"> & {
  city?: string | null;
  createdAt?: string | null;
};

// localStorage can throw (private mode, blocked storage); treat that as signed out.
function read(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

let cached: Session | null | undefined;
const listeners = new Set<() => void>();
function emit() {
  for (const listener of listeners) listener();
}

// Keep every open tab on the same session: when one tab refreshes tokens, signs in or signs out,
// the others pick it up instead of using a refresh token that was just replaced.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== SESSION_KEY && event.key !== null) return;
    cached = read();
    emit();
  });
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  if (cached === undefined) cached = read();
  return cached;
}

export function saveSession(session: Session | null) {
  cached = session;
  try {
    if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Session still lives in memory for this tab.
  }
  emit();
}

export function updateSession(patch: Partial<Session>) {
  const current = getSession();
  if (current) saveSession({ ...current, ...patch });
}

export const api = createPickeltonApi(baseUrl, {
  getAccessToken: () => getSession()?.token ?? null,
  getRefreshToken: () => getSession()?.refreshToken ?? null,
  onTokensRefreshed: (auth) => updateSession({ token: auth.token, refreshToken: auth.refreshToken }),
  onSessionExpired: () => saveSession(null),
});

export async function signIn(auth: AuthResponse) {
  saveSession({
    token: auth.token, refreshToken: auth.refreshToken, userId: auth.userId, name: auth.name, email: auth.email,
    phoneNumber: auth.phoneNumber, dateOfBirth: auth.dateOfBirth, emailVerified: auth.emailVerified, phoneVerified: auth.phoneVerified,
  });
  // Profile extras (city, member since) come from /users/me; signing in must not fail without them.
  const profile = await api.users.me().catch(() => null);
  if (profile) updateSession({ city: profile.city, createdAt: profile.createdAt });
}

export async function signOut() {
  const refreshToken = getSession()?.refreshToken;
  await api.auth.logout(refreshToken).catch(() => undefined);
  saveSession(null);
}

// Ends every session of this account: other browsers and phones sign out within minutes.
export async function signOutEverywhere() {
  await api.auth.logoutEverywhere();
  saveSession(null);
}

// undefined while rendering on the server or before hydration; null when signed out.
export function useSession(): Session | null | undefined {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => getSession(),
    () => undefined,
  );
}

export const errorMessage = apiErrorMessage;
export const isNotFound = (error: unknown) => (error as ApiError | undefined)?.status === 404;

// Loads data for a page; reload() re-runs it. Expired sessions are handled by the API layer.
export function useResource<T>(load: () => Promise<T>, deps: unknown[] = []) {
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
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [run]);

  useEffect(() => { void reload(); }, [reload]);
  return { data, setData, error, loading, reload };
}
