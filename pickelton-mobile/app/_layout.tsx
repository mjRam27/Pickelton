// pickelton-mobile/app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { hydrateSession } from "../services/api";
import { ThemeProvider, useTheme } from "../theme/ThemeProvider";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedStack />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedStack() {
  const { resolvedMode } = useTheme();
  useEffect(() => {
    hydrateSession();
  }, []);

  return (
    <>
      <StatusBar style={resolvedMode === "dark" ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <Stack screenOptions={{ headerShown: false }} />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
});
