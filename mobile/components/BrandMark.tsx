import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return <View style={styles.row}><Ionicons color={colors.primary} name="tennisball-outline" size={compact ? 18 : 22} /><Text style={[styles.name, compact && styles.compact]}>Pickelton</Text></View>;
}

const createStyles = (colors: ThemeColors) => ({
  row: { alignItems: "center", flexDirection: "row", gap: 7 },
  name: { color: colors.text, fontSize: 21, fontWeight: "900" },
  compact: { fontSize: 18 },
});
