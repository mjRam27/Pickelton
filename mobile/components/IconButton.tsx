import { Ionicons } from "@expo/vector-icons";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import type { ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

// 44pt square control used for back, close, share and similar header actions.
export function IconButton({ icon, label, onPress, tone = "surface", style }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  tone?: "surface" | "accent" | "overlay";
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const color = tone === "accent" ? colors.onAcc : tone === "overlay" ? "#F2F5EF" : colors.text;
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" hitSlop={4} onPress={onPress} style={({ pressed }) => [styles.button, styles[tone], pressed && styles.pressed, style]}>
      <Ionicons color={color} name={icon} size={22} />
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) => ({
  button: { alignItems: "center", borderRadius: 14, height: 44, justifyContent: "center", width: 44 },
  surface: { backgroundColor: colors.s1, borderColor: colors.line, borderWidth: 1 },
  accent: { backgroundColor: colors.acc },
  overlay: { backgroundColor: "rgba(12,16,14,0.6)" },
  pressed: { opacity: 0.75 },
});
