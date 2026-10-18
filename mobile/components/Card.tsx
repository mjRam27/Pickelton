import type { PropsWithChildren } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import type { ThemeColors } from "../theme/colors";
import { useThemeStyles } from "../theme/ThemeProvider";

export function Card({ children, onPress, accessibilityLabel, style }: PropsWithChildren<{ onPress?: () => void; accessibilityLabel?: string; style?: StyleProp<ViewStyle> }>) {
  const styles = useThemeStyles(createStyles);
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      {children}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) => ({
  card: { backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 20, borderWidth: 1, padding: 14 },
  pressed: { opacity: 0.85 },
});
