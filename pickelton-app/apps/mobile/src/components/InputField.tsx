// pickelton-app/apps/mobile/src/components/InputField.tsx
import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import type { AppIcon } from "./icons";
import { colors, radius } from "../theme/colors";

export function InputField({ label, icon: Icon, multiline, ...props }: TextInputProps & { label: string; icon?: AppIcon }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.container, multiline && styles.multiContainer]}>
        {Icon ? <Icon size={15} color={colors.muted} /> : null}
        <TextInput
          {...props}
          multiline={multiline}
          placeholderTextColor={colors.muted}
          style={[styles.input, multiline && styles.multiInput]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8, marginBottom: 16 },
  label: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  container: {
    alignItems: "center",
    backgroundColor: "#050606",
    borderColor: "#1e2322",
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    height: 48,
    paddingHorizontal: 13,
  },
  multiContainer: { alignItems: "flex-start", height: 108, paddingTop: 13 },
  input: { color: colors.text, flex: 1, fontSize: 13, fontWeight: "600" },
  multiInput: { height: 76, textAlignVertical: "top" },
});
