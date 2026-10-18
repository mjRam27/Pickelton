import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Avatar } from "../../../components/Avatar";
import { EmptyState, LoadingState } from "../../../components/EmptyState";
import { IconButton } from "../../../components/IconButton";
import { Notice } from "../../../components/Notice";
import { Screen } from "../../../components/Screen";
import { Display } from "../../../components/Typography";
import { apiErrorMessage, fetchLeaderboard, fetchTournament, getCurrentUser, type LeaderboardEntry } from "../../../services/api";
import { fonts, type ThemeColors } from "../../../theme/colors";
import { useTheme, useThemeStyles } from "../../../theme/ThemeProvider";

export default function LeaderboardScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const currentId = getCurrentUser()?.userId ?? getCurrentUser()?.id;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [board, event] = await Promise.all([fetchLeaderboard(id), fetchTournament(id).catch(() => null)]);
      setEntries(board.entries);
      if (event) setName(event.name);
      setUpdatedAt(new Date());
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { if (id) void load(); }, [id, load]);

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);
  const label = (entry: LeaderboardEntry) => (entry.userId === currentId ? "You" : entry.name);

  return (
    <Screen onRefresh={load} refreshing={loading && entries.length > 0}>
      <View style={styles.header}>
        <IconButton icon="chevron-back" label="Back to event" onPress={() => (router.canGoBack() ? router.back() : router.replace({ pathname: "/tournaments/[id]", params: { id } }))} />
        <View style={styles.headerCopy}>
          <Display numberOfLines={1} size={26}>{name || "Leaderboard"}</Display>
          <Text style={styles.updated}>{updatedAt ? `Standings · updated ${updatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "Standings"}</Text>
        </View>
      </View>
      <Notice message={error} />

      {loading && !entries.length ? <LoadingState label="Loading standings" /> : !entries.length ? (
        <EmptyState copy="Standings appear after the first completed match." icon="podium-outline" title="No results yet" />
      ) : <>
        <View style={styles.podium}>
          {[podium[1], podium[0], podium[2]].map((entry, slot) => {
            if (!entry) return <View key={slot} style={styles.podiumCol} />;
            const rank = slot === 1 ? 1 : slot === 0 ? 2 : 3;
            const first = rank === 1;
            return (
              <View key={entry.userId} style={styles.podiumCol}>
                {first ? <Ionicons color={colors.accInk} name="trophy" size={22} /> : null}
                <Avatar name={entry.name} size={first ? 60 : 52} tone={first ? "accent" : entry.userId === currentId ? "blue" : "plain"} />
                <Text numberOfLines={1} style={[styles.podiumName, entry.userId === currentId && { color: colors.accInk }]}>{label(entry)}</Text>
                <View style={[styles.step, { height: first ? 124 : rank === 2 ? 92 : 72 }, first && styles.stepFirst]}>
                  <Text style={[styles.stepRank, first && styles.onAcc, { fontSize: first ? 56 : rank === 2 ? 40 : 36 }]}>{rank}</Text>
                  <Text style={[styles.stepPts, first && styles.onAcc]}>{entry.points} pts</Text>
                </View>
              </View>
            );
          })}
        </View>

        {rest.length ? (
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHead]}>
              <Text style={[styles.headCell, styles.rankCol]}>#</Text>
              <Text style={[styles.headCell, styles.nameCol]}>Player</Text>
              <Text style={[styles.headCell, styles.numCol]}>W–L</Text>
              <Text style={[styles.headCell, styles.numCol]}>P</Text>
              <Text style={[styles.headCell, styles.numCol]}>Pts</Text>
            </View>
            {rest.map((entry, index) => (
              <View key={entry.userId} style={styles.tableRow}>
                <Text style={[styles.rank, styles.rankCol]}>{index + 4}</Text>
                <Text numberOfLines={1} style={[styles.name, styles.nameCol, entry.userId === currentId && { color: colors.accInk }]}>{label(entry)}</Text>
                <Text style={[styles.cell, styles.numCol]}>{entry.won}–{entry.lost}</Text>
                <Text style={[styles.cell, styles.numCol]}>{entry.played}</Text>
                <Text style={[styles.pts, styles.numCol]}>{entry.points}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </>}
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => ({
  header: { alignItems: "center", flexDirection: "row", gap: 12 },
  headerCopy: { flex: 1, gap: 2 },
  updated: { color: colors.muted, fontFamily: fonts.bold, fontSize: 12 },
  podium: { alignItems: "flex-end", flexDirection: "row", gap: 8, paddingTop: 6 },
  podiumCol: { alignItems: "center", flex: 1, gap: 6 },
  podiumName: { color: colors.text, fontFamily: fonts.bold, fontSize: 13, textAlign: "center" },
  step: { alignItems: "center", alignSelf: "stretch", backgroundColor: colors.s1, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, borderColor: colors.line, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 1, justifyContent: "center" },
  stepFirst: { backgroundColor: colors.acc, borderColor: colors.acc },
  stepRank: { color: colors.text, fontFamily: fonts.display },
  stepPts: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 12 },
  onAcc: { color: colors.onAcc },
  table: { backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  tableRow: { alignItems: "center", borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: "row", gap: 6, minHeight: 52, paddingHorizontal: 14 },
  tableHead: { minHeight: 38 },
  headCell: { color: colors.muted, fontFamily: fonts.heavy, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase" },
  rankCol: { width: 30 },
  nameCol: { flex: 1 },
  numCol: { textAlign: "right", width: 44 },
  rank: { color: colors.muted, fontFamily: fonts.display, fontSize: 22 },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  cell: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  pts: { color: colors.text, fontFamily: fonts.display, fontSize: 22 },
});
