import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { darkColors, lightColors, type ThemeColors } from "./colors";

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  colors: ThemeColors;
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "@pickelton/theme-mode";
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemMode = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === "system" || stored === "light" || stored === "dark") setMode(stored);
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, mode);
  }, [hydrated, mode]);

  const resolvedMode = mode === "system" ? (systemMode === "light" ? "light" : "dark") : mode;
  const value = useMemo<ThemeContextValue>(() => ({
    colors: resolvedMode === "light" ? lightColors : darkColors,
    mode,
    resolvedMode,
    setMode,
  }), [mode, resolvedMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}

export function useThemeStyles<T extends Record<string, unknown>>(factory: (colors: ThemeColors) => T): { [Key in keyof T]: any } {
  const { colors } = useTheme();
  return useMemo(() => StyleSheet.create(factory(colors) as any), [colors, factory]);
}
