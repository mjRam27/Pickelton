import { Pressable, ScrollView, Text, View } from "react-native";
import { fonts, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

type Option<T extends string> = { value: T; label: string; activeColor?: string };

// Pill-in-track switch for 2-4 mutually exclusive choices.
export function Segmented<T extends string>({ options, value, onChange, label }: { options: Option<T>[]; value: T; onChange: (value: T) => void; label?: string }) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  return (
    <View accessibilityLabel={label} accessibilityRole="tablist" style={styles.track}>
      {options.map((option) => {
        const active = option.value === value;
        const fill = active ? option.activeColor ?? colors.s1 : "transparent";
        return (
          <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} key={option.value} onPress={() => onChange(option.value)} style={[styles.segment, { backgroundColor: fill }]}>
            <Text style={[styles.segmentLabel, active && styles.segmentActive, active && option.activeColor ? { color: colors.onAcc } : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Horizontally scrolling filter chips. "accent" fills with lime, "ink" fills with the text colour.
export function Chips<T extends string>({ options, value, onChange, tone = "accent" }: { options: Option<T>[]; value: T; onChange: (value: T) => void; tone?: "accent" | "ink" }) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  return (
    <ScrollView contentContainerStyle={styles.chips} horizontal showsHorizontalScrollIndicator={false}>
      {options.map((option) => {
        const active = option.value === value;
        const fill = tone === "accent" ? colors.acc : colors.text;
        const ink = tone === "accent" ? colors.onAcc : colors.bg;
        return (
          <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} key={option.value} onPress={() => onChange(option.value)} style={[styles.chip, active && { backgroundColor: fill, borderColor: fill }]}>
            <Text style={[styles.chipLabel, active && { color: ink }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => ({
  track: { backgroundColor: colors.s2, borderRadius: 14, flexDirection: "row", gap: 4, padding: 4 },
  segment: { alignItems: "center", borderRadius: 10, flex: 1, justifyContent: "center", minHeight: 44 },
  segmentLabel: { color: colors.muted, fontFamily: fonts.bold, fontSize: 15 },
  segmentActive: { color: colors.text, fontFamily: fonts.heavy },
  chips: { gap: 8 },
  chip: { alignItems: "center", borderColor: colors.line, borderRadius: 20, borderWidth: 1.5, height: 40, justifyContent: "center", paddingHorizontal: 14 },
  chipLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 13 },
});
