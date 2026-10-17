import { Text, View, type TextProps } from "react-native";
import { fonts, type ThemeColors } from "../theme/colors";
import { useThemeStyles } from "../theme/ThemeProvider";

// Big Shoulders headline. Uppercased like the design's display type.
export function Display({ size = 34, style, children, ...props }: TextProps & { size?: number }) {
  const styles = useThemeStyles(createStyles);
  return <Text {...props} style={[styles.display, { fontSize: size, lineHeight: Math.round(size * 1.02) }, style]}>{children}</Text>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.sectionRow}>
      <Text accessibilityRole="header" style={styles.section}>{title}</Text>
      {action ? <Text onPress={onAction} style={styles.action}>{action}</Text> : null}
    </View>
  );
}

export function Eyebrow({ style, ...props }: TextProps) {
  const styles = useThemeStyles(createStyles);
  return <Text {...props} style={[styles.eyebrow, style]} />;
}

const createStyles = (colors: ThemeColors) => ({
  display: { color: colors.text, fontFamily: fonts.display, textTransform: "uppercase" },
  sectionRow: { alignItems: "baseline", flexDirection: "row", justifyContent: "space-between" },
  section: { color: colors.text, fontFamily: fonts.heavy, fontSize: 17 },
  action: { color: colors.accInk, fontFamily: fonts.bold, fontSize: 13 },
  eyebrow: { color: colors.muted, fontFamily: fonts.heavy, fontSize: 12, letterSpacing: 0.9, textTransform: "uppercase" },
});
