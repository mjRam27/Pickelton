// pickelton-app/apps/mobile/src/components/Tag.tsx
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme/colors";

export function Tag({ children, tone = "lime" }: { children: ReactNode; tone?: "lime" | "dark" | "blue" }) {
  const fill = tone === "lime" ? colors.lime : tone === "blue" ? colors.blue : colors.raised;
  const textColor = tone === "dark" ? colors.muted : colors.bg;
  return (
    <View style={[styles.tag, { backgroundColor: fill }]}>
      <Text style={[styles.text, { color: textColor }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { alignSelf: "flex-start", borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 5 },
  text: { fontSize: 9, fontWeight: "800", letterSpacing: 0 },
});
