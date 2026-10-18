// pickelton-mobile/app/_layout.tsx
import { Archivo_400Regular, Archivo_500Medium, Archivo_600SemiBold, Archivo_700Bold, Archivo_800ExtraBold } from "@expo-google-fonts/archivo";
import { BigShouldersDisplay_800ExtraBold, BigShouldersDisplay_900Black } from "@expo-google-fonts/big-shoulders-display";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../theme/ThemeProvider";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Archivo_400Regular, Archivo_500Medium, Archivo_600SemiBold, Archivo_700Bold, Archivo_800ExtraBold,
    BigShouldersDisplay_800ExtraBold, BigShouldersDisplay_900Black,
  });
  // Render with system fonts if loading fails rather than blocking the app.
  if (!fontsLoaded && !fontError) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedStack />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedStack() {
  const { colors, resolvedMode } = useTheme();
  return (
    <>
      <StatusBar style={resolvedMode === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg }, headerShown: false }} />
    </>
  );
}
