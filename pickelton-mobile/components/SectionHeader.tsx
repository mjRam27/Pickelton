// pickelton-mobile/components/SectionHeader.tsx
import { Text, View } from "react-native";
import type { ThemeColors } from "../theme/colors";
import { useThemeStyles } from "../theme/ThemeProvider";

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  const styles = useThemeStyles(createStyles);
  return <View style={styles.row}><View style={styles.marker} /><Text style={styles.title}>{title}</Text>{action ? <Text style={styles.action}>{action}</Text> : null}</View>;
}

const createStyles = (colors: ThemeColors) => ({
  row: { alignItems: "center", flexDirection: "row", gap: 9, marginBottom: 13, marginTop: 25 },
  marker: { backgroundColor: colors.primary, borderRadius: 2, height: 18, width: 3 },
  title: { color: colors.text, flex: 1, fontSize: 12, fontWeight: "900", letterSpacing: 0.6 },
  action: { color: colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
});
