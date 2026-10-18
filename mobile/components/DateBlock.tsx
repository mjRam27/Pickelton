import { Text, View } from "react-native";
import { fonts, type ThemeColors } from "../theme/colors";
import { useThemeStyles } from "../theme/ThemeProvider";

// Month-over-day calendar tile used in event and schedule rows.
export function DateBlock({ date, color, width = 52, height = 56 }: { date: string; color: string; width?: number; height?: number }) {
  const styles = useThemeStyles(createStyles);
  const parsed = new Date(date);
  const valid = !Number.isNaN(parsed.getTime());
  return (
    <View style={[styles.block, { height, width }]}>
      <Text style={[styles.month, { color }]}>{valid ? parsed.toLocaleDateString("en-IN", { month: "short" }).toUpperCase() : "TBA"}</Text>
      <Text style={styles.day}>{valid ? String(parsed.getDate()).padStart(2, "0") : "--"}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  block: { alignItems: "center", backgroundColor: colors.s2, borderRadius: 14, flexShrink: 0, justifyContent: "center" },
  month: { fontFamily: fonts.heavy, fontSize: 11 },
  day: { color: colors.text, fontFamily: fonts.display, fontSize: 26, lineHeight: 28 },
});
