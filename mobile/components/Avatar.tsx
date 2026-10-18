import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { fonts, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export type AvatarTone = "accent" | "blue" | "hot" | "plain";

export function initials(name?: string | null) {
  const letters = (name ?? "").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return letters || "PL";
}

// Stable colour per person so the same player keeps the same avatar everywhere.
export function toneFor(seed: string): AvatarTone {
  const tones: AvatarTone[] = ["accent", "blue", "hot", "plain"];
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return tones[Math.abs(hash) % tones.length];
}

export function Avatar({ name, size = 40, tone = "plain", square = false, display = false, style }: {
  name?: string | null;
  size?: number;
  tone?: AvatarTone;
  square?: boolean;
  display?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const look = {
    accent: [colors.acc, colors.onAcc],
    blue: [colors.blu, colors.onBlu],
    hot: [colors.hot, colors.onHot],
    plain: [colors.s2, colors.text],
  }[tone];
  return (
    <View style={[styles.avatar, { backgroundColor: look[0], borderRadius: square ? size * 0.3 : size / 2, height: size, width: size }, style]}>
      <Text style={[display ? styles.display : styles.text, { color: look[1], fontSize: display ? size * 0.42 : size * 0.34 }]}>{initials(name)}</Text>
    </View>
  );
}

const createStyles = (_colors: ThemeColors) => ({
  avatar: { alignItems: "center", flexShrink: 0, justifyContent: "center" },
  text: { fontFamily: fonts.heavy },
  display: { fontFamily: fonts.display },
});
