// pickelton-mobile/components/CardContainer.tsx
import type { PropsWithChildren } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { radius, type ThemeColors } from "../theme/colors";
import { useThemeStyles } from "../theme/ThemeProvider";

export function CardContainer({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const styles = useThemeStyles(createStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

const createStyles = (colors: ThemeColors) => ({
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, padding: 16 },
});
