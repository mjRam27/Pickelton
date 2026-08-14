// pickelton-mobile/theme/colors.ts
export const darkColors = {
  background: "#121212",
  surface: "#1e1e1e",
  raised: "#242424",
  elevated: "#2a2a2a",
  border: "#333333",
  text: "#ffffff",
  muted: "#a0a0a0",
  primary: "#ccff00",
  primaryDim: "#596f00",
  primarySoft: "#263000",
  danger: "#ff5c68",
  blue: "#c6c6c7",
  gold: "#e4e2e1",
} as const;

export type ThemeColors = { [Key in keyof typeof darkColors]: string };

export const lightColors: ThemeColors = {
  background: "#f2f5ed",
  surface: "#ffffff",
  raised: "#e8eee0",
  elevated: "#dce5d2",
  border: "#cbd6bf",
  text: "#172014",
  muted: "#65705f",
  primary: "#7fa800",
  primaryDim: "#a5bd58",
  primarySoft: "#e2edbd",
  danger: "#c43745",
  blue: "#50647a",
  gold: "#8f6d19",
};

// Kept as a dark fallback for screens still loading before the provider mounts.
export const colors = darkColors;

export const radius = { sm: 4, md: 8, lg: 12 } as const;
