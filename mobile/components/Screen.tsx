import type { PropsWithChildren, ReactNode } from "react";
import { RefreshControl, ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import type { ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

// Page shell: themed background, safe area, scrolling body and an optional sticky footer for the main action.
export function Screen({ children, footer, header, contentStyle, scroll = true, refreshing, onRefresh }: PropsWithChildren<{
  footer?: ReactNode;
  header?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}>) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        {header}
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, !footer && { paddingBottom: 32 + insets.bottom }, contentStyle]}
            keyboardShouldPersistTaps="handled"
            refreshControl={onRefresh ? <RefreshControl onRefresh={onRefresh} refreshing={Boolean(refreshing)} tintColor={colors.muted} /> : undefined}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : <View style={[styles.content, styles.fill, { paddingBottom: 28 + insets.bottom }, contentStyle]}>{children}</View>}
        {footer ? <View style={[styles.footer, { paddingBottom: 14 + insets.bottom }]}>{footer}</View> : null}
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.bg, flex: 1 },
  safe: { flex: 1 },
  content: { gap: 16, paddingBottom: 24, paddingHorizontal: 20, paddingTop: 12 },
  fill: { flex: 1 },
  footer: { backgroundColor: colors.bg, borderTopColor: colors.line, borderTopWidth: 1, gap: 10, paddingHorizontal: 20, paddingTop: 14 },
});
