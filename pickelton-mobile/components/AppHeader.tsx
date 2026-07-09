import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { getCurrentUser } from "../services/api";
import type { ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";
import { AccountMenu, initials } from "./AccountMenu";

export function AppHeader({ eyebrow, title }: { eyebrow?: string; title?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return (
    <><View style={styles.header}>
      <Pressable accessibilityLabel="Open account menu" onPress={() => setMenuOpen(true)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
        <Ionicons color={colors.text} name="menu" size={23} />
      </Pressable>
      <View>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>
      <Pressable accessibilityLabel="Open notifications" style={({ pressed }) => [styles.notification, pressed && styles.pressed]}>
        <Ionicons color={colors.text} name="notifications-outline" size={20} />
        <View style={styles.dot} />
      </Pressable>
      <Pressable accessibilityLabel="Open account menu" onPress={() => setMenuOpen(true)} style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}>
        <Text style={styles.avatarText}>{initials(getCurrentUser()?.name)}</Text>
      </Pressable>
    </View><AccountMenu onClose={() => setMenuOpen(false)} visible={menuOpen} /></>
  );
}

const createStyles = (colors: ThemeColors) => ({
  header: { alignItems: "center", flexDirection: "row", gap: 12 },
  iconButton: { alignItems: "center", height: 40, justifyContent: "center", width: 28 },
  eyebrow: { color: colors.muted, fontSize: 12, fontWeight: "400" },
  title: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 1 },
  notification: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, height: 40, justifyContent: "center", marginLeft: "auto", position: "relative", width: 40 },
  dot: { backgroundColor: colors.danger, borderColor: colors.surface, borderRadius: 5, borderWidth: 1.5, height: 8, position: "absolute", right: 9, top: 8, width: 8 },
  avatar: { alignItems: "center", backgroundColor: "#DDE7DF", borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  avatarText: { color: colors.primary, fontSize: 12, fontWeight: "900" },
  pressed: { opacity: 0.75 },
});
