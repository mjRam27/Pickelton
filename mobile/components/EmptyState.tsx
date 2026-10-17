import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";
import { fonts, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";
import { Button } from "./Button";

export function EmptyState({ title, copy, icon = "tennisball-outline", action, onAction }: {
  title: string;
  copy: string;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.empty}>
      <View style={styles.icon}><Ionicons color={colors.accInk} name={icon} size={24} /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.copy}>{copy}</Text>
      {action && onAction ? <Button label={action} onPress={onAction} size="md" style={styles.action} variant="outline" /> : null}
    </View>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return (
    <View accessibilityLabel={label} style={styles.loading}>
      <ActivityIndicator color={colors.accInk} />
      <Text style={styles.copy}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  empty: { alignItems: "center", backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 20, borderStyle: "dashed", borderWidth: 1.5, gap: 6, padding: 24 },
  icon: { alignItems: "center", backgroundColor: colors.s2, borderRadius: 16, height: 48, justifyContent: "center", marginBottom: 4, width: 48 },
  title: { color: colors.text, fontFamily: fonts.heavy, fontSize: 16, textAlign: "center" },
  copy: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, textAlign: "center" },
  action: { alignSelf: "stretch", marginTop: 8 },
  loading: { alignItems: "center", gap: 10, paddingVertical: 32 },
});
