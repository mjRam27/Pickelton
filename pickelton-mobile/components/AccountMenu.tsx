import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Modal, Pressable, Text, View } from "react-native";
import { getCurrentUser, logout } from "../services/api";
import type { ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles, type ThemeMode } from "../theme/ThemeProvider";
import { PrimaryButton } from "./PrimaryButton";
import { StatusPill } from "./StatusPill";

export function AccountMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [user, setUser] = useState(getCurrentUser());
  const { colors, mode, setMode } = useTheme();
  const styles = useThemeStyles(createStyles);
  function go(path: "/profile" | "/(tabs)/clubs" | "/(tabs)/tournaments" | "/host/status" | "/(auth)/login" | "/(auth)/signup") {
    onClose();
    router.push(path);
  }
  async function signOut() {
    await logout();
    setUser(null);
    onClose();
    router.replace("/(auth)/login");
  }
  return <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
    <Pressable onPress={onClose} style={styles.backdrop}>
      <Pressable onPress={(event) => event.stopPropagation()} style={styles.menu}>
        {user ? <>
          <View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>{initials(user.name)}</Text></View><View style={styles.identityCopy}><Text style={styles.name}>{user.name}</Text><Text style={styles.email}>{user.email}</Text></View><StatusPill label="SIGNED IN" /></View>
          <Text style={styles.description}>Your Pickelton account for live scores, club activity, tournaments, and host tools.</Text>
          <View style={styles.links}>
            <MenuLink icon="person-outline" label="My profile" copy="Personal details and account status" onPress={() => go("/profile")} />
            <MenuLink icon="people-outline" label="My clubs" copy="Browse communities and memberships" onPress={() => go("/(tabs)/clubs")} />
            <MenuLink icon="trophy-outline" label="Tournaments" copy="Events, registration, and leaderboard" onPress={() => go("/(tabs)/tournaments")} />
            <MenuLink icon="shield-checkmark-outline" label="Host desk" copy="Verification and tournament tools" onPress={() => go("/host/status")} />
          </View>
          <AppearancePicker mode={mode} onChange={setMode} />
          <PrimaryButton icon="log-out-outline" label="LOG OUT" onPress={signOut} variant="outline" />
        </> : <>
          <View style={styles.identity}><View style={styles.avatar}><Ionicons color={colors.primary} name="person-outline" size={19} /></View><View style={styles.identityCopy}><Text style={styles.name}>Welcome, player</Text><Text style={styles.email}>Sign in to unlock your account</Text></View></View>
          <Text style={styles.description}>Log in to keep your profile, clubs, registrations, and host activity in one place.</Text>
          <AppearancePicker mode={mode} onChange={setMode} />
          <PrimaryButton icon="log-in-outline" label="LOG IN" onPress={() => go("/(auth)/login")} />
          <PrimaryButton icon="person-add-outline" label="CREATE ACCOUNT" onPress={() => go("/(auth)/signup")} style={styles.secondary} variant="outline" />
        </>}
      </Pressable>
    </Pressable>
  </Modal>;
}

function MenuLink({ icon, label, copy, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; copy: string; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.link, pressed && styles.pressed]}><View style={styles.linkIcon}><Ionicons color={colors.primary} name={icon} size={17} /></View><View style={styles.linkCopy}><Text style={styles.linkLabel}>{label}</Text><Text style={styles.linkDescription}>{copy}</Text></View><Ionicons color={colors.muted} name="chevron-forward" size={15} /></Pressable>;
}

function AppearancePicker({ mode, onChange }: { mode: ThemeMode; onChange: (mode: ThemeMode) => void }) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const choices: { icon: keyof typeof Ionicons.glyphMap; label: string; value: ThemeMode }[] = [
    { icon: "phone-portrait-outline", label: "SYSTEM", value: "system" },
    { icon: "sunny-outline", label: "LIGHT", value: "light" },
    { icon: "moon-outline", label: "DARK", value: "dark" },
  ];
  return <View style={styles.appearance}><Text style={styles.appearanceLabel}>APPEARANCE</Text><View style={styles.themeRow}>{choices.map((choice) => <Pressable accessibilityLabel={`Use ${choice.label.toLowerCase()} theme`} key={choice.value} onPress={() => onChange(choice.value)} style={[styles.themeChoice, mode === choice.value && styles.themeChoiceActive]}><Ionicons color={mode === choice.value ? colors.background : colors.muted} name={choice.icon} size={14} /><Text style={[styles.themeText, mode === choice.value && styles.themeTextActive]}>{choice.label}</Text></Pressable>)}</View></View>;
}

export function initials(name?: string) { return name ? name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() : "PL"; }
const createStyles = (colors: ThemeColors) => ({
  backdrop: { backgroundColor: "rgba(0,0,0,0.62)", flex: 1, paddingHorizontal: 14, paddingTop: 68 },
  menu: { alignSelf: "flex-end", backgroundColor: colors.raised, borderColor: colors.border, borderRadius: 12, borderTopColor: colors.primary, borderTopWidth: 3, borderWidth: 1, maxWidth: 390, padding: 15, width: "100%" },
  identity: { alignItems: "center", flexDirection: "row", gap: 10 }, avatar: { alignItems: "center", backgroundColor: colors.primarySoft, borderColor: colors.primaryDim, borderRadius: 22, borderWidth: 1, height: 44, justifyContent: "center", width: 44 }, avatarText: { color: colors.primary, fontSize: 12, fontWeight: "900" },
  identityCopy: { flex: 1 }, name: { color: colors.text, fontSize: 14, fontWeight: "900" }, email: { color: colors.muted, fontSize: 10, marginTop: 4 }, description: { color: colors.muted, fontSize: 11, lineHeight: 17, marginVertical: 14 },
  links: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, marginBottom: 14 },
  link: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 10, minHeight: 58, paddingVertical: 8 }, linkIcon: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 8, height: 34, justifyContent: "center", width: 34 }, linkCopy: { flex: 1 }, linkLabel: { color: colors.text, fontSize: 12, fontWeight: "900" }, linkDescription: { color: colors.muted, fontSize: 9, marginTop: 3 }, secondary: { marginTop: 9 }, pressed: { opacity: 0.72 },
  appearance: { marginBottom: 14 }, appearanceLabel: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.7, marginBottom: 7 }, themeRow: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 4, padding: 4 }, themeChoice: { alignItems: "center", borderRadius: 6, flex: 1, flexDirection: "row", gap: 5, justifyContent: "center", minHeight: 34 }, themeChoiceActive: { backgroundColor: colors.primary }, themeText: { color: colors.muted, fontSize: 8, fontWeight: "900" }, themeTextActive: { color: colors.background },
});
