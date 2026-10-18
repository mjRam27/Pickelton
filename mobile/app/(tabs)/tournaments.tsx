import { useCallback, useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency, formatShortDate } from "@pickelton/utils";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { PulseDot } from "../../components/Brand";
import { Card } from "../../components/Card";
import { DateBlock } from "../../components/DateBlock";
import { EmptyState, LoadingState } from "../../components/EmptyState";
import { Notice } from "../../components/Notice";
import { Screen } from "../../components/Screen";
import { Chips } from "../../components/Segmented";
import { Display } from "../../components/Typography";
import { apiErrorMessage, fetchTournaments, type Tournament } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

type SportFilter = "ALL" | "PICKLEBALL" | "BADMINTON";
const LIVE_STATUSES = ["LIVE", "ONGOING", "IN_PROGRESS"];

export default function TournamentsScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const [items, setItems] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<SportFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await fetchTournaments());
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const live = items.find((item) => LIVE_STATUSES.includes(item.status));
  const visible = useMemo(() => items
    .filter((item) => item !== live)
    .filter((item) => filter === "ALL" || item.sportType === filter || item.sportType === "BOTH")
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()), [items, live, filter]);

  return (
    <Screen onRefresh={load} refreshing={loading && items.length > 0}>
      <View style={styles.header}>
        <Display size={44}>Events</Display>
        <Pressable accessibilityLabel="Host a tournament" accessibilityRole="button" onPress={() => router.push("/tournaments/create")} style={({ pressed }) => [styles.host, pressed && styles.pressed]}>
          <Ionicons color={colors.text} name="add" size={18} />
          <Text style={styles.hostText}>Host</Text>
        </Pressable>
      </View>

      {live ? (
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/tournaments/[id]/leaderboard", params: { id: live.id } })} style={({ pressed }) => [styles.live, pressed && styles.pressed]}>
          <View style={styles.liveTop}>
            <View style={styles.liveTag}><PulseDot color={colors.hot} /><Text style={styles.liveLabel}>LIVE NOW</Text></View>
            <Text style={styles.liveMeta}>Standings</Text>
          </View>
          <Display size={28}>{live.name}</Display>
          <Text style={styles.liveMeta}>{[live.clubName, `${live.maxPlayers} players max`].filter(Boolean).join(" · ")}</Text>
        </Pressable>
      ) : null}

      <Chips<SportFilter> onChange={setFilter} options={[{ label: "All sports", value: "ALL" }, { label: "Pickleball", value: "PICKLEBALL" }, { label: "Badminton", value: "BADMINTON" }]} value={filter} />
      <Notice message={error} />

      {loading && !items.length ? <LoadingState label="Loading events" /> : visible.length ? visible.map((item) => {
        const badminton = item.sportType === "BADMINTON";
        const ink = badminton ? colors.bluInk : colors.accInk;
        return (
          <Card accessibilityLabel={`${item.name}, ${formatShortDate(item.startDate)}`} key={item.id} onPress={() => router.push({ pathname: "/tournaments/[id]", params: { id: item.id } })} style={styles.event}>
            <DateBlock color={ink} date={item.startDate} height={66} width={58} />
            <View style={styles.eventCopy}>
              <Text numberOfLines={2} style={styles.eventName}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.eventMeta}>{[formatShortDate(item.startDate), item.clubName].filter(Boolean).join(" · ")}</Text>
              <View style={styles.eventFacts}>
                <Text style={[styles.fact, { color: ink }]}>{item.sportType === "BOTH" ? "Both" : badminton ? "Badminton" : "Pickleball"}</Text>
                <Text style={styles.fact}>{item.entryFee ? formatCurrency(item.entryFee) : "Free"}</Text>
                <Text style={[styles.fact, styles.mutedFact]}>{item.tournamentType === "DOUBLES" ? "Doubles" : "Singles"} · {item.maxPlayers} max</Text>
              </View>
            </View>
          </Card>
        );
      }) : <EmptyState action={error ? "Try again" : undefined} copy={error ? "We couldn't reach the events list." : "No events for this sport yet. Club owners and admins can host one."} icon="trophy-outline" onAction={error ? load : undefined} title="No events yet" />}
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => ({
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingTop: 8 },
  host: { alignItems: "center", backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 6, height: 44, paddingHorizontal: 14 },
  hostText: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  pressed: { opacity: 0.85 },
  live: { backgroundColor: colors.s1, borderColor: colors.hot, borderRadius: 22, borderWidth: 1.5, gap: 10, padding: 16 },
  liveTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  liveTag: { alignItems: "center", flexDirection: "row", gap: 6 },
  liveLabel: { color: colors.hotInk, fontFamily: fonts.heavy, fontSize: 12, letterSpacing: 1 },
  liveMeta: { color: colors.muted, fontFamily: fonts.bold, fontSize: 13 },
  event: { flexDirection: "row", gap: 14 },
  eventCopy: { flex: 1, gap: 5 },
  eventName: { color: colors.text, fontFamily: fonts.heavy, fontSize: 15 },
  eventMeta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  eventFacts: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  fact: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  mutedFact: { color: colors.muted },
});
