import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { logout } from "../services/api";
import { fonts, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles, type ThemeMode } from "../theme/ThemeProvider";
import { Button } from "./Button";
import { Segmented } from "./Segmented";

// Bottom sheet opened from the profile's settings button: appearance, host desk and sign out.
export function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const styles = useThemeStyles(createStyles);
  const { colors, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  async function signOut() {
    await logout();
    onClose();
    router.replace("/(auth)/login");
  }
  function openHostDesk() {
    onClose();
    router.push("/host/status");
  }
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityLabel="Close settings" onPress={onClose} style={styles.backdrop}>
        <Pressable onPress={(event) => event.stopPropagation()} style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.label}>Appearance</Text>
          <Segmented<ThemeMode>
            label="Appearance"
            onChange={setMode}
            options={[{ label: "System", value: "system" }, { label: "Light", value: "light" }, { label: "Dark", value: "dark" }]}
            value={mode}
          />
          <Pressable accessibilityRole="button" onPress={openHostDesk} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <Ionicons color={colors.bluInk} name="shield-checkmark-outline" size={22} />
            <Text style={styles.rowText}>Host desk</Text>
            <Ionicons color={colors.muted} name="chevron-forward" size={20} />
          </Pressable>
          <Button icon="log-out-outline" label="Log out" onPress={signOut} variant="outline" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => ({
  backdrop: { backgroundColor: "rgba(0,0,0,0.55)", flex: 1, justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, gap: 14, paddingHorizontal: 20, paddingTop: 10 },
  handle: { alignSelf: "center", backgroundColor: colors.line, borderRadius: 3, height: 5, width: 44 },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 32, textTransform: "uppercase" },
  label: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 13 },
  row: { alignItems: "center", backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 56, paddingHorizontal: 14 },
  rowText: { color: colors.text, flex: 1, fontFamily: fonts.bold, fontSize: 15 },
  pressed: { opacity: 0.8 },
});
