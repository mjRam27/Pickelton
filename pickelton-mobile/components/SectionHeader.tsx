// pickelton-mobile/components/SectionHeader.tsx
import { Text, View } from "react-native";
import type { ThemeColors } from "../theme/colors";
import { useThemeStyles } from "../theme/ThemeProvider";

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  const styles = useThemeStyles(createStyles);
  return <View style={styles.row}><Text style={styles.title}>{title}</Text>{action ? <Text style={styles.action}>{action}</Text> : null}</View>;
}

const createStyles = (colors: ThemeColors) => ({
  row: { alignItems: "baseline", flexDirection: "row", gap: 9, marginBottom: 10, marginTop: 24 },
  title: { color: colors.text, flex: 1, fontSize: 16, fontWeight: "800", letterSpacing: 0 },
  action: { color: colors.primary, fontSize: 12, fontWeight: "700", letterSpacing: 0 },
});
