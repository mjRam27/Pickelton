import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export function EmptyState({ title, copy }: { title: string; copy: string }) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return <View style={styles.empty}><View style={styles.icon}><Ionicons color={colors.primary} name="tennisball-outline" size={31} /></View><Text style={styles.title}>{title}</Text><Text style={styles.copy}>{copy}</Text></View>;
}

const createStyles = (colors: ThemeColors) => ({
  empty: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, gap: 7, padding: 28 },
  icon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 24, height: 72, justifyContent: "center", marginBottom: 4, width: 72 },
  title: { color: colors.text, fontSize: 16, fontWeight: "800" },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 2, textAlign: "center" },
});
