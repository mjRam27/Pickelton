import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { formatShortDate } from "@pickelton/utils";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Avatar, toneFor } from "../../components/Avatar";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { DateBlock } from "../../components/DateBlock";
import { EmptyState, LoadingState } from "../../components/EmptyState";
import { Notice } from "../../components/Notice";
import { Screen } from "../../components/Screen";
import { Display, Eyebrow, SectionTitle } from "../../components/Typography";
import { apiErrorMessage, fetchPlayerSuggestions, fetchTournaments, fetchUserStats, getCurrentUser, setPlayerFollow, type PlayerSuggestion, type Tournament, type UserStats } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

export default function HomeScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const user = getCurrentUser();
  const userId = user?.userId ?? user?.id;
  const firstName = user?.name?.split(" ")[0] || "Player";
  const [stats, setStats] = useState<UserStats | null>(null);
  const [upcoming, setUpcoming] = useState<Tournament[]>([]);
  const [people, setPeople] = useState<PlayerSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const now = Date.now();
    const [statsResult, eventsResult, peopleResult] = await Promise.allSettled([
      userId ? fetchUserStats(userId) : Promise.resolve(null),
      fetchTournaments(),
      fetchPlayerSuggestions(),
    ]);
    if (statsResult.status === "fulfilled") setStats(statsResult.value);
    if (eventsResult.status === "fulfilled") {
      setUpcoming(eventsResult.value
        .filter((event) => new Date(event.startDate).getTime() >= now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 3));
    }
    if (peopleResult.status === "fulfilled") setPeople(peopleResult.value);
    const failed = [statsResult, eventsResult, peopleResult].find((result) => result.status === "rejected");
    if (failed?.status === "rejected") setError(apiErrorMessage(failed.reason));
    setLoading(false);
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  async function toggleFollow(person: PlayerSuggestion) {
    const next = !person.following;
    setPeople((items) => items.map((item) => item.userId === person.userId ? { ...item, following: next } : item));
    try {
      await setPlayerFollow(person.userId, next);
    } catch {
      setPeople((items) => items.map((item) => item.userId === person.userId ? { ...item, following: !next } : item));
    }
  }

  const winRate = stats && stats.totalMatches ? `${Math.round((stats.wins / stats.totalMatches) * 100)}%` : "–";
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });

  return (
    <Screen onRefresh={load} refreshing={loading && Boolean(stats || upcoming.length)}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Eyebrow>{today}</Eyebrow>
          <Display size={34}>{`Hi, ${firstName}`}</Display>
        </View>
        <Pressable accessibilityLabel="Your profile" accessibilityRole="button" onPress={() => router.push("/profile")}>
          <Avatar name={user?.name} size={44} tone="blue" />
        </Pressable>
      </View>

      <View style={styles.actions}>
        <QuickAction icon="add" label="New match" onPress={() => router.push("/match/create")} primary />
        <QuickAction icon="trophy-outline" label="Find events" onPress={() => router.push("/(tabs)/tournaments")} tint={colors.accInk} />
        <QuickAction icon="location-outline" label="Clubs near me" onPress={() => router.push("/(tabs)/clubs")} tint={colors.bluInk} />
      </View>

      <Notice message={error} />

      <View style={styles.section}>
        <SectionTitle action="All stats" onAction={() => router.push("/profile")} title="Your record" />
        <View style={styles.stats}>
          <Stat label="Matches" value={stats ? String(stats.totalMatches) : "–"} />
          <Stat label="Won – lost" value={stats ? `${stats.wins}–${stats.losses}` : "–"} />
          <Stat label="Win rate" tint={colors.hotInk} value={winRate} />
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle action="All events" onAction={() => router.push("/(tabs)/tournaments")} title="Coming up" />
        {loading && !upcoming.length ? <LoadingState label="Loading events" /> : upcoming.length ? upcoming.map((event) => (
          <Card accessibilityLabel={`${event.name}, ${formatShortDate(event.startDate)}`} key={event.id} onPress={() => router.push({ pathname: "/tournaments/[id]", params: { id: event.id } })} style={styles.row}>
            <DateBlock color={event.sportType === "BADMINTON" ? colors.bluInk : colors.hotInk} date={event.startDate} />
            <View style={styles.rowCopy}>
              <Text numberOfLines={1} style={styles.rowTitle}>{event.name}</Text>
              <Text numberOfLines={1} style={styles.rowMeta}>{[event.clubName, event.tournamentType.toLowerCase()].filter(Boolean).join(" · ")}</Text>
            </View>
            <Badge label={event.status.replaceAll("_", " ")} tone="outline" />
          </Card>
        )) : <EmptyState action="Browse events" copy="No upcoming tournaments yet. Check the events tab for what's open." icon="calendar-outline" onAction={() => router.push("/(tabs)/tournaments")} title="Nothing scheduled" />}
      </View>

      <View style={styles.section}>
        <SectionTitle title="People to play with" />
        {people.length ? people.map((person) => (
          <Card key={person.userId} style={styles.row}>
            <Avatar name={person.name} tone={toneFor(person.userId)} />
            <View style={styles.rowCopy}>
              <Text numberOfLines={1} style={styles.rowTitle}>{person.name}</Text>
              <Text numberOfLines={1} style={styles.rowMeta}>{person.reason === "RECENT_PLAYER" ? "Played with you recently" : person.reason === "NEARBY" ? `Nearby · ${person.city ?? "your area"}` : person.city ?? "Pickelton community"}</Text>
            </View>
            <Pressable accessibilityLabel={`${person.following ? "Unfollow" : "Follow"} ${person.name}`} accessibilityRole="button" onPress={() => toggleFollow(person)} style={[styles.follow, person.following && styles.following]}>
              <Text style={[styles.followText, person.following && styles.followingText]}>{person.following ? "Following" : "Follow"}</Text>
            </Pressable>
          </Card>
        )) : !loading ? <Text style={styles.muted}>Play a match or set your city to get player suggestions.</Text> : null}
      </View>
    </Screen>
  );
}

function QuickAction({ icon, label, onPress, primary = false, tint }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; primary?: boolean; tint?: string }) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <View style={[styles.actionIcon, primary && { backgroundColor: colors.acc }]}>
        <Ionicons color={primary ? colors.onAcc : tint} name={icon} size={20} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function Stat({ value, label, tint }: { value: string; label: string; tint?: string }) {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.stat}>
      <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.statValue, tint ? { color: tint } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingTop: 8 },
  greeting: { flex: 1, gap: 2 },
  actions: { flexDirection: "row", gap: 10 },
  action: { backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 18, borderWidth: 1, flex: 1, gap: 10, padding: 14 },
  actionIcon: { alignItems: "center", backgroundColor: colors.s2, borderRadius: 12, height: 36, justifyContent: "center", width: 36 },
  actionLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 13 },
  pressed: { opacity: 0.85 },
  section: { gap: 10 },
  stats: { flexDirection: "row", gap: 10 },
  stat: { backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flex: 1, gap: 2, paddingHorizontal: 14, paddingVertical: 12 },
  statValue: { color: colors.text, fontFamily: fonts.display, fontSize: 34, lineHeight: 36 },
  statLabel: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  row: { alignItems: "center", flexDirection: "row", gap: 14, padding: 12 },
  rowCopy: { flex: 1, gap: 3 },
  rowTitle: { color: colors.text, fontFamily: fonts.heavy, fontSize: 15 },
  rowMeta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  follow: { borderColor: colors.line, borderRadius: 12, borderWidth: 1.5, justifyContent: "center", minHeight: 40, paddingHorizontal: 12 },
  following: { backgroundColor: colors.acc, borderColor: colors.acc },
  followText: { color: colors.text, fontFamily: fonts.heavy, fontSize: 13 },
  followingText: { color: colors.onAcc },
  muted: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
});
