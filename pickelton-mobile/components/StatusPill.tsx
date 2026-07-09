import { Text, View } from "react-native";
import type { ThemeColors } from "../theme/colors";
import { useThemeStyles } from "../theme/ThemeProvider";

export function StatusPill({ label, tone = "primary" }: { label: string; tone?: "primary" | "muted" | "danger" | "gold" }) {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={[styles.pill, styles[`${tone}Pill`]]}>
      <Text style={[styles.label, styles[`${tone}Label`]]}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  pill: { alignSelf: "flex-start", borderRadius: 14, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  label: { fontSize: 10, fontWeight: "800", letterSpacing: 0 },
  primaryPill: { backgroundColor: colors.accent, borderColor: colors.accent },
  primaryLabel: { color: colors.primary },
  mutedPill: { backgroundColor: colors.raised, borderColor: colors.border },
  mutedLabel: { color: colors.muted },
  dangerPill: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft },
  dangerLabel: { color: colors.danger },
  goldPill: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  goldLabel: { color: colors.gold },
});
