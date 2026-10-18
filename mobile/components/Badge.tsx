import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { fonts, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export type BadgeTone = "accent" | "blue" | "hot" | "outline" | "muted";

export function Badge({ label, tone = "accent", style }: { label: string; tone?: BadgeTone; style?: StyleProp<ViewStyle> }) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const look = {
    accent: { backgroundColor: colors.acc, color: colors.onAcc },
    blue: { backgroundColor: colors.blu, color: colors.onBlu },
    hot: { backgroundColor: colors.hot, color: colors.onHot },
    outline: { backgroundColor: "transparent", color: colors.text },
    muted: { backgroundColor: colors.s2, color: colors.muted },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: look.backgroundColor }, tone === "outline" && styles.outline, style]}>
      <Text style={[styles.label, { color: look.color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  badge: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  outline: { borderColor: colors.line, borderWidth: 1.5 },
  label: { fontFamily: fonts.heavy, fontSize: 11, letterSpacing: 0.4 },
});
