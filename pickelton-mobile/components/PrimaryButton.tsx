// pickelton-mobile/components/PrimaryButton.tsx
import { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Animated, Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { radius, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export function PrimaryButton({ label, onPress, disabled = false, variant = "primary", style, icon }: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline" | "subtle";
  style?: StyleProp<ViewStyle>;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const scale = useRef(new Animated.Value(1)).current;
  function animate(toValue: number) {
    Animated.spring(scale, { friction: 6, tension: 180, toValue, useNativeDriver: true }).start();
  }
  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <Pressable disabled={disabled} onPress={onPress} onPressIn={() => animate(0.97)} onPressOut={() => animate(1)} style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed, disabled && styles.disabled]}>
        <View style={styles.content}>{icon ? <Ionicons color={variant === "primary" ? colors.background : colors.primary} name={icon} size={16} /> : null}<Text style={[styles.label, variant === "primary" ? styles.darkLabel : styles.lightLabel]}>{label}</Text></View>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  button: { alignItems: "center", borderRadius: radius.md, borderWidth: 1, justifyContent: "center", minHeight: 50, paddingHorizontal: 16 },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  outline: { backgroundColor: "transparent", borderColor: colors.border },
  subtle: { backgroundColor: colors.raised, borderColor: colors.border },
  label: { fontSize: 11, fontWeight: "900", letterSpacing: 0.4 },
  darkLabel: { color: colors.background },
  lightLabel: { color: colors.text },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.4 },
  content: { alignItems: "center", flexDirection: "row", gap: 8 },
});
