import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { getCurrentUser } from "../services/api";
import type { ThemeColors } from "../theme/colors";
import { useThemeStyles } from "../theme/ThemeProvider";
import { AccountMenu, initials } from "./AccountMenu";
import { BrandMark } from "./BrandMark";

export function AppHeader({ eyebrow, title }: { eyebrow?: string; title?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const styles = useThemeStyles(createStyles);
  return (
    <><View style={styles.header}>
      <View>
        <BrandMark compact />
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>
      <Pressable accessibilityLabel="Open account menu" onPress={() => setMenuOpen(true)} style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}>
        <Text style={styles.avatarText}>{initials(getCurrentUser()?.name)}</Text>
      </Pressable>
    </View><AccountMenu onClose={() => setMenuOpen(false)} visible={menuOpen} /></>
  );
}

const createStyles = (colors: ThemeColors) => ({
  header: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  eyebrow: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1, marginTop: 8 },
  title: { color: colors.text, fontSize: 21, fontWeight: "900", marginTop: 3 },
  avatar: { alignItems: "center", backgroundColor: colors.primarySoft, borderColor: colors.primaryDim, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  avatarText: { color: colors.primary, fontSize: 10, fontWeight: "900" },
  pressed: { opacity: 0.75 },
});
