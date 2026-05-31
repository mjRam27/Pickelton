// pickelton-mobile/components/InputField.tsx
import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import { colors, radius } from "../theme/colors";

export function InputField({ label, multiline, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={colors.muted}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8, marginBottom: 14 },
  label: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  input: { backgroundColor: "#050606", borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, color: colors.text, fontSize: 13, minHeight: 48, paddingHorizontal: 13 },
  multiline: { minHeight: 100, paddingTop: 13, textAlignVertical: "top" },
});
