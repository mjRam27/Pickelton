import { Text } from "react-native";
import type { ThemeColors } from "../theme/colors";
import { useThemeStyles } from "../theme/ThemeProvider";

export function ScreenIntro({ title, accent, copy }: { title: string; accent: string; copy: string }) {
  const styles = useThemeStyles(createStyles);
  return (
    <>
      <Text style={styles.title}>{title}{"\n"}<Text style={styles.primary}>{accent}</Text></Text>
      <Text style={styles.copy}>{copy}</Text>
    </>
  );
}

const createStyles = (colors: ThemeColors) => ({
  title: { color: colors.text, fontSize: 31, fontWeight: "900", lineHeight: 35, marginTop: 22 },
  primary: { color: colors.primary },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 9 },
});
