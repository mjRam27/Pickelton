import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { fonts, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export function TextField({ label, hint, icon, multiline, ...props }: TextInputProps & {
  label?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const isPassword = Boolean(props.secureTextEntry);
  return (
    <View style={styles.group}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.shell, multiline && styles.multilineShell, focused && styles.focused]}>
        {icon ? <Ionicons color={colors.muted} name={icon} size={20} style={styles.icon} /> : null}
        <TextInput
          accessibilityLabel={label ?? props.placeholder}
          {...props}
          multiline={multiline}
          onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
          onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
          placeholderTextColor={colors.muted}
          secureTextEntry={isPassword && !revealed}
          style={[styles.input, multiline && styles.multiline]}
        />
        {isPassword ? (
          <Pressable accessibilityLabel={revealed ? "Hide password" : "Show password"} onPress={() => setRevealed((value) => !value)} style={styles.reveal}>
            <Ionicons color={colors.muted} name={revealed ? "eye-off-outline" : "eye-outline"} size={20} />
          </Pressable>
        ) : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  group: { gap: 6 },
  label: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 13 },
  shell: { alignItems: "center", backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 14, borderWidth: 1.5, flexDirection: "row", minHeight: 52 },
  multilineShell: { alignItems: "flex-start" },
  focused: { borderColor: colors.acc },
  icon: { marginLeft: 14 },
  input: { color: colors.text, flex: 1, fontFamily: fonts.regular, fontSize: 16, minHeight: 49, paddingHorizontal: 16 },
  multiline: { minHeight: 96, paddingTop: 13, textAlignVertical: "top" },
  reveal: { alignItems: "center", height: 48, justifyContent: "center", width: 48 },
  hint: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
});
