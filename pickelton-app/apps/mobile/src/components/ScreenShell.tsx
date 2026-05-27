// pickelton-app/apps/mobile/src/components/ScreenShell.tsx
import type { ReactNode } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

export function ScreenShell({ children, scroll = true, footer }: { children: ReactNode; scroll?: boolean; footer?: ReactNode }) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {body}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  content: { flexGrow: 1, padding: 18, paddingBottom: 30 },
});
