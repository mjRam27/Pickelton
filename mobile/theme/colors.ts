// pickelton-mobile/theme/colors.ts
import { darkPalette, lightPalette, type Palette } from "@pickelton/constants";

export type ThemeColors = Palette;
export const darkColors: ThemeColors = darkPalette;
export const lightColors: ThemeColors = lightPalette;

// Kept as a dark fallback for screens still loading before the provider mounts.
export const colors = darkColors;

export const radius = { sm: 8, md: 14, lg: 20, xl: 24 } as const;

// Each weight ships as its own font file, so pick the family instead of setting fontWeight.
export const fonts = {
  regular: "Archivo_400Regular",
  medium: "Archivo_500Medium",
  semibold: "Archivo_600SemiBold",
  bold: "Archivo_700Bold",
  heavy: "Archivo_800ExtraBold",
  display: "BigShouldersDisplay_900Black",
  displayBold: "BigShouldersDisplay_800ExtraBold",
} as const;
