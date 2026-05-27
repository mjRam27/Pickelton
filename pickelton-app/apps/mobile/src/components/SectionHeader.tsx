// pickelton-app/apps/mobile/src/components/SectionHeader.tsx
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "./icons";
import { colors } from "../theme/colors";

export function SectionHeader({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? (
        <Pressable onPress={onPress} style={styles.action}>
          <Text style={styles.actionText}>{action}</Text>
          <ChevronRight size={13} color={colors.lime} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 13, marginTop: 22 },
  title: { color: colors.text, fontSize: 16, fontWeight: "900", letterSpacing: 0 },
  action: { alignItems: "center", flexDirection: "row", gap: 2 },
  actionText: { color: colors.lime, fontSize: 10, fontWeight: "800" },
});
