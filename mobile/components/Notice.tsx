import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { fonts, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

// Inline feedback for form errors, confirmations and background-load failures.
export function Notice({ message, tone = "error" }: { message?: string | null; tone?: "error" | "success" | "info" }) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  if (!message) return null;
  const ink = { error: colors.hotInk, success: colors.accInk, info: colors.bluInk }[tone];
  const icon = { error: "alert-circle-outline", success: "checkmark-circle-outline", info: "information-circle-outline" }[tone] as keyof typeof Ionicons.glyphMap;
  return (
    <View accessibilityLiveRegion="polite" accessibilityRole={tone === "error" ? "alert" : undefined} style={[styles.notice, { borderColor: ink }]}>
      <Ionicons color={ink} name={icon} size={18} />
      <Text style={[styles.text, { color: ink }]}>{message}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  notice: { alignItems: "flex-start", backgroundColor: colors.s1, borderRadius: 14, borderWidth: 1.5, flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  text: { flex: 1, fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
});
