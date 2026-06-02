import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";
import { router } from "expo-router";
import type { ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export function BackLink({ label = "BACK" }: { label?: string }) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.link, pressed && styles.pressed]}><Ionicons color={colors.primary} name="arrow-back" size={15} /><Text style={styles.label}>{label}</Text></Pressable>;
}

const createStyles = (colors: ThemeColors) => ({
  link: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 7, marginBottom: 18 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  pressed: { opacity: 0.7 },
});
