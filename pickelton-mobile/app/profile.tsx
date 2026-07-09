import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../components/AppHeader";
import { CardContainer } from "../components/CardContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionHeader } from "../components/SectionHeader";
import { StatusPill } from "../components/StatusPill";
import { initials } from "../components/AccountMenu";
import { getCurrentUser, logout } from "../services/api";
import type { ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export default function ProfileScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const user = getCurrentUser();

  async function signOut() {
    await logout();
    router.replace("/(auth)/login");
  }

  if (!user) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.content}>
            <AppHeader eyebrow="Profile" title="Player card" />
            <CardContainer style={styles.signedOut}>
              <View style={styles.largeIcon}><Ionicons color={colors.primary} name="person-outline" size={31} /></View>
              <Text style={styles.signedOutTitle}>Sign in to view your Pickelton profile.</Text>
              <PrimaryButton icon="log-in-outline" label="Log in" onPress={() => router.replace("/(auth)/login")} />
            </CardContainer>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <AppHeader eyebrow="Player profile" title={user.name} />

          <CardContainer style={styles.playerCard}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials(user.name)}</Text></View>
              <View style={styles.identity}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.handle}>{user.email}</Text>
              </View>
              <StatusPill label={user.role ?? "USER"} />
            </View>
            <View style={styles.statRow}>
              <MiniStat value="3.4" label="Rating" />
              <MiniStat value="12" label="Matches" />
              <MiniStat value="67%" label="Win rate" />
            </View>
            <PrimaryButton label="Edit profile" variant="outline" onPress={() => router.push("/profile/edit")} style={styles.editButton} />
          </CardContainer>

          <SectionHeader title="Personal details" />
          <CardContainer style={styles.detailCard}>
            <Detail icon="mail-outline" label="Email address" value={user.email} verified={user.emailVerified} />
            <Detail icon="call-outline" label="Phone number" value={user.phoneNumber} verified={user.phoneVerified} />
            <Detail icon="calendar-outline" label="Date of birth" value={user.dateOfBirth} />
          </CardContainer>

          <SectionHeader title="Shortcuts" />
          <View style={styles.shortcuts}>
            <Shortcut icon="trophy-outline" title="My clubs" onPress={() => router.push("/(tabs)/clubs")} />
            <Shortcut icon="calendar-outline" title="Tournaments" onPress={() => router.push("/(tabs)/tournaments")} />
            <Shortcut icon="shield-checkmark-outline" title="Host desk" onPress={() => router.push("/host/status")} />
            <Shortcut icon="card-outline" title="Payments" />
          </View>

          <SectionHeader title="Settings" />
          <CardContainer style={styles.settings}>
            <Setting icon="notifications-outline" label="Notifications" value="Matches only" />
            <Setting icon="location-outline" label="Search radius" value="5 km" />
            <Setting icon="eye-outline" label="Profile visibility" value="Everyone" />
          </CardContainer>

          <PrimaryButton icon="log-out-outline" label="Log out" onPress={signOut} style={styles.logout} variant="outline" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  const styles = useThemeStyles(createStyles);
  return <View style={styles.miniStat}><Text style={styles.miniValue}>{value}</Text><Text style={styles.miniLabel}>{label}</Text></View>;
}

function Detail({ icon, label, value, verified }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; verified?: boolean }) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return <View style={styles.detail}><Ionicons color={colors.primary} name={icon} size={20} /><View style={styles.detailCopy}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>{typeof verified === "boolean" ? <StatusPill label={verified ? "Verified" : "Pending"} tone={verified ? "primary" : "gold"} /> : null}</View>;
}

function Shortcut({ icon, title, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; onPress?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}><Ionicons color={colors.primary} name={icon} size={21} /><Text style={styles.shortcutText}>{title}</Text></Pressable>;
}

function Setting({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return <View style={styles.setting}><Ionicons color={colors.primary} name={icon} size={20} /><Text style={styles.settingLabel}>{label}</Text><Text style={styles.settingValue}>{value}</Text><Ionicons color={colors.subtle} name="chevron-forward" size={18} /></View>;
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 110 },
  signedOut: { alignItems: "center", gap: 16, marginTop: 22 },
  largeIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 24, height: 72, justifyContent: "center", width: 72 },
  signedOutTitle: { color: colors.text, fontSize: 17, fontWeight: "800", lineHeight: 23, textAlign: "center" },
  playerCard: { backgroundColor: colors.text, borderColor: colors.text, borderRadius: 22, marginTop: 18, padding: 18 },
  cardTop: { alignItems: "center", flexDirection: "row", gap: 12 },
  avatar: { alignItems: "center", backgroundColor: "#DDE7DF", borderRadius: 28, height: 56, justifyContent: "center", width: 56 },
  avatarText: { color: colors.primary, fontSize: 16, fontWeight: "900" },
  identity: { flex: 1 },
  name: { color: colors.surface, fontSize: 18, fontWeight: "900" },
  handle: { color: colors.muted, fontSize: 12, marginTop: 3 },
  statRow: { flexDirection: "row", gap: 9, marginTop: 18 },
  miniStat: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 15, flex: 1, padding: 12 },
  miniValue: { color: colors.accent, fontSize: 21, fontWeight: "900" },
  miniLabel: { color: colors.primaryDim, fontSize: 11, marginTop: 2 },
  detailCard: { paddingVertical: 0 },
  detail: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 12, minHeight: 64 },
  detailCopy: { flex: 1 },
  detailLabel: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  detailValue: { color: colors.text, fontSize: 13, fontWeight: "800", marginTop: 3 },
  shortcuts: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  shortcut: { alignItems: "center", backgroundColor: colors.accent, borderRadius: 16, flexDirection: "row", gap: 9, justifyContent: "center", minHeight: 50, paddingHorizontal: 14, width: "48.5%" },
  shortcutText: { color: colors.primary, fontSize: 13, fontWeight: "900" },
  settings: { paddingVertical: 0 },
  setting: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 12, minHeight: 58 },
  settingLabel: { color: colors.text, flex: 1, fontSize: 14, fontWeight: "700" },
  settingValue: { color: colors.muted, fontSize: 12 },
  logout: { marginTop: 22 },
  editButton: { marginTop: 14 },
  pressed: { opacity: 0.82 },
});
