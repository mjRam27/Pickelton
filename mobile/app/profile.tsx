import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { IconButton } from "../components/IconButton";
import { Notice } from "../components/Notice";
import { Screen } from "../components/Screen";
import { SettingsSheet } from "../components/SettingsSheet";
import { Display, SectionTitle } from "../components/Typography";
import { apiErrorMessage, fetchUserStats, getCurrentUser, type UserStats } from "../services/api";
import { fonts, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export default function ProfileScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const user = getCurrentUser();
  const userId = user?.userId ?? user?.id;
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setError("");
      setStats(await fetchUserStats(userId));
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)"));

  if (!user) {
    return (
      <Screen>
        <IconButton icon="chevron-back" label="Back" onPress={back} />
        <EmptyState action="Log in" copy="Log in to see your profile and match record." icon="person-outline" onAction={() => router.replace("/(auth)/login")} title="You're signed out" />
      </Screen>
    );
  }

  const winRate = stats && stats.totalMatches ? `${Math.round((stats.wins / stats.totalMatches) * 100)}%` : "–";
  const since = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : null;

  return (
    <Screen onRefresh={load}>
      <View style={styles.header}>
        <IconButton icon="chevron-back" label="Back" onPress={back} />
        <IconButton icon="settings-outline" label="Settings" onPress={() => setSettingsOpen(true)} />
      </View>

      <View style={styles.identity}>
        <Avatar display name={user.name} size={84} tone="blue" />
        <View style={styles.identityCopy}>
          <Display size={34}>{user.name || "Player"}</Display>
          <Text style={styles.meta}>{[user.city, since ? `since ${since}` : null].filter(Boolean).join(" · ") || user.email}</Text>
        </View>
      </View>

      <View style={styles.band}>
        <BandStat label="Matches" value={stats ? String(stats.totalMatches) : "–"} />
        <BandStat label="Win rate" value={winRate} />
        <BandStat label="Wins" value={stats ? String(stats.wins) : "–"} />
      </View>
      <Notice message={error} />

      <View style={styles.section}>
        <SectionTitle title="Account" />
        <View style={styles.list}>
          <Detail label="Email" status={user.emailVerified} value={user.email} />
          <Detail label="Phone" status={user.phoneVerified} value={user.phoneNumber} />
          <Detail label="Date of birth" last value={user.dateOfBirth} />
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.push("/host/status")} style={({ pressed }) => [styles.host, pressed && styles.pressed]}>
        <Ionicons color={colors.bluInk} name="shield-checkmark" size={26} />
        <View style={styles.hostCopy}>
          <Text style={styles.hostTitle}>Become a verified host</Text>
          <Text style={styles.hostMeta}>Run paid tournaments with the blue badge</Text>
        </View>
        <Ionicons color={colors.muted} name="chevron-forward" size={20} />
      </Pressable>

      <Button icon="people-outline" label="My clubs" onPress={() => router.push("/(tabs)/clubs")} size="md" variant="outline" />
      <SettingsSheet onClose={() => setSettingsOpen(false)} visible={settingsOpen} />
    </Screen>
  );
}

function BandStat({ value, label }: { value: string; label: string }) {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.bandStat}>
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.bandValue}>{value}</Text>
      <Text style={styles.bandLabel}>{label}</Text>
    </View>
  );
}

function Detail({ label, value, status, last = false }: { label: string; value?: string | null; status?: boolean; last?: boolean }) {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={[styles.detail, !last && styles.detailBorder]}>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || "Not set"}</Text>
      </View>
      {typeof status === "boolean" ? <Badge label={status ? "Verified" : "Pending"} tone={status ? "accent" : "outline"} /> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  header: { flexDirection: "row", justifyContent: "space-between" },
  identity: { alignItems: "center", flexDirection: "row", gap: 16 },
  identityCopy: { flex: 1, gap: 4 },
  meta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  band: { backgroundColor: colors.text, borderRadius: 20, flexDirection: "row" },
  bandStat: { flex: 1, gap: 2, padding: 14 },
  bandValue: { color: colors.bg, fontFamily: fonts.display, fontSize: 40, lineHeight: 42 },
  bandLabel: { color: colors.bg, fontFamily: fonts.semibold, fontSize: 12, opacity: 0.75 },
  section: { gap: 8 },
  list: { backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 20, borderWidth: 1, paddingHorizontal: 16 },
  detail: { alignItems: "center", flexDirection: "row", gap: 10, minHeight: 60, paddingVertical: 10 },
  detailBorder: { borderBottomColor: colors.line, borderBottomWidth: 1 },
  detailCopy: { flex: 1, gap: 2 },
  detailLabel: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 12 },
  detailValue: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  host: { alignItems: "center", borderColor: colors.line, borderRadius: 18, borderWidth: 1.5, flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  hostCopy: { flex: 1, gap: 2 },
  hostTitle: { color: colors.text, fontFamily: fonts.heavy, fontSize: 15 },
  hostMeta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  pressed: { opacity: 0.85 },
});
