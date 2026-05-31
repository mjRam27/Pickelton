// pickelton-mobile/components/SectionHeader.tsx
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function SectionHeader({ title }: { title: string }) {
  return <View style={styles.row}><View style={styles.marker} /><Text style={styles.title}>{title}</Text></View>;
}

const styles = StyleSheet.create({
  row: { alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 12, marginTop: 22 },
  marker: { backgroundColor: colors.primary, height: 15, width: 2 },
  title: { color: colors.text, fontSize: 10, fontWeight: "900" },
});
