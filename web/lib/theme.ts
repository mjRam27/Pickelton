// web/lib/theme.ts
"use client";

export type ThemeMode = "system" | "light" | "dark";
const THEME_KEY = "pickelton.theme";

export function getThemeMode(): ThemeMode {
  const value = typeof document === "undefined" ? undefined : document.documentElement.dataset.theme;
  return value === "light" || value === "dark" ? value : "system";
}

// Per-device preference; storage failures just mean it isn't remembered.
export function setThemeMode(mode: ThemeMode) {
  try {
    if (mode === "system") {
      localStorage.removeItem(THEME_KEY);
      delete document.documentElement.dataset.theme;
    } else {
      localStorage.setItem(THEME_KEY, mode);
      document.documentElement.dataset.theme = mode;
    }
  } catch {
    if (mode !== "system") document.documentElement.dataset.theme = mode;
  }
}
