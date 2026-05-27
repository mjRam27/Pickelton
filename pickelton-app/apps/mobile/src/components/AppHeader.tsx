// pickelton-app/apps/mobile/src/components/AppHeader.tsx
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Brand } from "./Brand";
import { Bell, ChevronLeft, Menu } from "./icons";
import { colors } from "../theme/colors";

export function AppHeader({ backLabel, onBack, simple = false }: { backLabel?: string; onBack?: () => void; simple?: boolean }) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Pressable onPress={onBack} disabled={!onBack}>
          {onBack ? <ChevronLeft size={17} color={colors.muted} /> : <Menu size={17} color={colors.blue} />}
        </Pressable>
        <Brand />
      </View>
      {simple && backLabel ? <Text style={styles.backLabel}>{backLabel}</Text> : <Bell size={15} color={colors.lime} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", height: 54, justifyContent: "space-between", marginBottom: 20 },
  left: { alignItems: "center", flexDirection: "row", gap: 12 },
  backLabel: { color: colors.muted, fontSize: 9, fontWeight: "800" },
});
