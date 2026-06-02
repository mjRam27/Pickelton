import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export function EmptyState({ title, copy }: { title: string; copy: string }) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return <View style={styles.empty}><Ionicons color={colors.primary} name="tennisball-outline" size={25} /><Text style={styles.title}>{title}</Text><Text style={styles.copy}>{copy}</Text></View>;
}

const createStyles = (colors: ThemeColors) => ({
  empty: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderStyle: "dashed", borderWidth: 1, gap: 3, padding: 22 },
  title: { color: colors.text, fontSize: 12, fontWeight: "900" },
  copy: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 7, textAlign: "center" },
});
