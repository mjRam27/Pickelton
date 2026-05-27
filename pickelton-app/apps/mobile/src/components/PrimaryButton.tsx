// pickelton-app/apps/mobile/src/components/PrimaryButton.tsx
import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import type { AppIcon } from "./icons";
import { colors, radius } from "../theme/colors";

export function PrimaryButton({ label, onPress, Icon, disabled = false, variant = "primary", style }: {
  label: string;
  onPress?: () => void;
  Icon?: AppIcon;
  disabled?: boolean;
  variant?: "primary" | "outline" | "subtle";
  style?: ViewStyle | ViewStyle[];
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], style, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={[styles.label, variant !== "primary" && styles.lightLabel]}>{label}</Text>
      {Icon ? <Icon size={16} color={variant === "primary" ? colors.bg : colors.text} strokeWidth={2.6} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primary: { backgroundColor: colors.lime, borderColor: colors.lime },
  outline: { backgroundColor: "transparent", borderColor: colors.border },
  subtle: { backgroundColor: colors.raised, borderColor: colors.border },
  label: { color: colors.bg, fontSize: 12, fontWeight: "900" },
  lightLabel: { color: colors.text },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.42 },
});
