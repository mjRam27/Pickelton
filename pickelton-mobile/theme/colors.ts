export const lightColors = {
  background: "#F7F7F3",
  canvas: "#EDECE6",
  surface: "#FFFFFF",
  raised: "#EFEFEA",
  elevated: "#EAF3DA",
  border: "#EAEAE2",
  text: "#101613",
  muted: "#5C6660",
  subtle: "#9AA39D",
  primary: "#0C4A38",
  primaryDim: "#BFD6C9",
  primarySoft: "#EAF3DA",
  accent: "#C8F550",
  accentSoft: "#DDF3A8",
  danger: "#8A4444",
  dangerSoft: "#F5E3E0",
  blue: "#2C3A78",
  gold: "#7A5218",
} as const;

export const darkColors = {
  background: "#0F1512",
  canvas: "#101613",
  surface: "#17201B",
  raised: "#202821",
  elevated: "#26352B",
  border: "#2A332C",
  text: "#F4F6F1",
  muted: "#9BA69E",
  subtle: "#5F6B62",
  primary: "#C8F550",
  primaryDim: "#6A7E35",
  primarySoft: "#223116",
  accent: "#C8F550",
  accentSoft: "#33451A",
  danger: "#E4572E",
  dangerSoft: "#3A211B",
  blue: "#D7DCF0",
  gold: "#F0D9B8",
} as const;

export type ThemeColors = { [Key in keyof typeof lightColors]: string };

// Kept as a dark fallback for screens still loading before the provider mounts.
export const colors = darkColors;

export const radius = { sm: 8, md: 14, lg: 18, xl: 22, pill: 999 } as const;
