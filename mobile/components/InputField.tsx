// pickelton-mobile/components/InputField.tsx
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, type TextInputProps, View } from "react-native";
import { radius, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export function InputField({ label, multiline, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const isPassword = Boolean(props.secureTextEntry);
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, focused && styles.focused]}>
        <TextInput
          {...props}
          multiline={multiline}
          onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
          onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
          placeholderTextColor={colors.muted}
          secureTextEntry={isPassword && !passwordVisible}
          style={[styles.input, multiline && styles.multiline]}
        />
        {isPassword ? (
          <Pressable accessibilityLabel={passwordVisible ? "Hide password" : "Show password"} onPress={() => setPasswordVisible((visible) => !visible)} style={styles.visibility}>
            <Ionicons color={colors.muted} name={passwordVisible ? "eye-off-outline" : "eye-outline"} size={19} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  group: { gap: 8, marginBottom: 15 },
  label: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  inputShell: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", minHeight: 52 },
  input: { color: colors.text, flex: 1, fontSize: 13, minHeight: 50, paddingHorizontal: 14 },
  focused: { borderColor: colors.primary },
  multiline: { minHeight: 100, paddingTop: 13, textAlignVertical: "top" },
  visibility: { alignItems: "center", height: 50, justifyContent: "center", width: 48 },
});
