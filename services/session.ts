export type StoredSession = {
  token?: string;
  refreshToken?: string;
  user?: unknown;
};

const TOKEN_KEY = "pickelton_token";
const REFRESH_TOKEN_KEY = "pickelton_refresh_token";
const USER_KEY = "pickelton_user";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeSession(session: StoredSession) {
  if (typeof window === "undefined") return;

  if (session.token) {
    window.localStorage.setItem(TOKEN_KEY, session.token);
  }

  if (session.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  }

  if (session.user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  }
}

export function getStoredSessionUser<T>() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
