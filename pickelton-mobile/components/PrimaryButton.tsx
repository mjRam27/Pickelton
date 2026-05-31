// pickelton-mobile/components/PrimaryButton.tsx
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "../theme/colors";

export function PrimaryButton({ label, onPress, disabled = false, variant = "primary", style }: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline" | "subtle";
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, styles[variant], style, pressed && styles.pressed, disabled && styles.disabled]}>
      <Text style={[styles.label, variant === "primary" ? styles.darkLabel : styles.lightLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", borderRadius: radius.sm, borderWidth: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: 16 },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  outline: { backgroundColor: "transparent", borderColor: colors.border },
  subtle: { backgroundColor: colors.raised, borderColor: colors.border },
  label: { fontSize: 11, fontWeight: "900" },
  darkLabel: { color: colors.background },
  lightLabel: { color: colors.text },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.4 },
});
