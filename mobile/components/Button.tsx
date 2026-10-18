import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { fonts, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

type Variant = "primary" | "outline" | "dark" | "ghost";

export function Button({ label, onPress, variant = "primary", size = "lg", icon, iconRight, disabled = false, loading = false, style }: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: "lg" | "md";
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const tint = { primary: colors.onAcc, outline: colors.text, dark: colors.bg, ghost: colors.text }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.base, size === "md" && styles.md, styles[variant], pressed && styles.pressed, (disabled || loading) && styles.disabled, style]}
    >
      <View style={styles.row}>
        {loading ? <ActivityIndicator color={tint} size="small" /> : icon ? <Ionicons color={tint} name={icon} size={19} /> : null}
        <Text numberOfLines={1} style={[styles.label, size === "md" && styles.mdLabel, { color: tint }]}>{label}</Text>
        {iconRight && !loading ? <Ionicons color={tint} name={iconRight} size={19} /> : null}
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) => ({
  base: { alignItems: "center", borderRadius: 16, borderWidth: 1.5, justifyContent: "center", minHeight: 56, paddingHorizontal: 16 },
  md: { minHeight: 48, borderRadius: 14 },
  primary: { backgroundColor: colors.acc, borderColor: colors.acc },
  outline: { backgroundColor: "transparent", borderColor: colors.line },
  dark: { backgroundColor: colors.text, borderColor: colors.text },
  ghost: { backgroundColor: "transparent", borderColor: "transparent" },
  row: { alignItems: "center", flexDirection: "row", gap: 8 },
  label: { fontFamily: fonts.heavy, fontSize: 17 },
  mdLabel: { fontSize: 15 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.45 },
});
