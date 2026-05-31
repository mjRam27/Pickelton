// pickelton-mobile/app/match/scoring.tsx
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors } from "../../theme/colors";

type Point = "a" | "b";
type SetScore = { a: number; b: number };

export default function ScoringScreen() {
  const { authorized } = useLocalSearchParams<{ authorized?: string }>();
  const isAuthorized = authorized === "true";
  const [scoreA, setScoreA] = useState(18);
  const [scoreB, setScoreB] = useState(14);
  const [history, setHistory] = useState<Point[]>([]);
  const [sets, setSets] = useState<SetScore[]>([{ a: 11, b: 9 }]);
  const [ended, setEnded] = useState(false);

  function addPoint(player: Point) {
    if (!isAuthorized || ended) return;
    setHistory((current) => [...current, player]);
    if (player === "a") setScoreA((current) => current + 1);
    else setScoreB((current) => current + 1);
  }

  function undo() {
    if (!isAuthorized || ended || !history.length) return;
    const player = history[history.length - 1];
    setHistory((current) => current.slice(0, -1));
    if (player === "a") setScoreA((current) => Math.max(0, current - 1));
    else setScoreB((current) => Math.max(0, current - 1));
  }

  function endSet() {
    if (!isAuthorized || ended) return;
    setSets((current) => [...current, { a: scoreA, b: scoreB }]);
    setScoreA(0);
    setScoreB(0);
    setHistory([]);
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
        <Text onPress={() => router.replace("/(tabs)")} style={styles.brand}>PICKELTON  /  LIVE</Text>
        <Text style={styles.live}>{ended ? "COMPLETED" : "LIVE"}</Text>
        <View style={styles.players}><Text style={styles.player}>PLAYER A</Text><Text style={styles.vs}>VS</Text><Text style={styles.player}>PLAYER B</Text></View>
        <CardContainer style={styles.scoreCard}>
          <View style={styles.scoreRow}><Text style={styles.scorePrimary}>{scoreA}</Text><View style={styles.divider} /><Text style={styles.score}>{scoreB}</Text></View>
          <Text style={styles.setTitle}>SET {sets.length + 1}</Text>
          <Text style={styles.meta}>{sets.map((set, index) => `SET ${index + 1}: ${set.a}-${set.b}`).join("   ")}</Text>
        </CardContainer>
        {!isAuthorized ? <Text style={styles.viewOnly}>VIEW ONLY MODE - AUTHORIZED OFFICIALS ONLY</Text> : null}
        <View style={styles.row}>
          <PrimaryButton label="PLAYER A +1" onPress={() => addPoint("a")} disabled={!isAuthorized || ended} style={styles.flex} />
          <PrimaryButton label="PLAYER B +1" onPress={() => addPoint("b")} disabled={!isAuthorized || ended} variant="subtle" style={styles.flex} />
        </View>
        <View style={styles.row}>
          <PrimaryButton label="UNDO" onPress={undo} disabled={!isAuthorized || ended || !history.length} variant="outline" style={styles.flex} />
          <PrimaryButton label="END SET" onPress={endSet} disabled={!isAuthorized || ended} variant="outline" style={styles.flex} />
          <PrimaryButton label="END MATCH" onPress={() => setEnded(true)} disabled={!isAuthorized || ended} variant="outline" style={styles.flex} />
        </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  brand: { color: colors.primary, fontSize: 14, fontStyle: "italic", fontWeight: "900" },
  live: { alignSelf: "center", backgroundColor: colors.primaryDim, borderRadius: 12, color: colors.primary, fontSize: 10, fontWeight: "900", marginBottom: 22, marginTop: 34, paddingHorizontal: 13, paddingVertical: 6 },
  players: { flexDirection: "row", justifyContent: "space-around", marginBottom: 17 },
  player: { color: colors.text, fontSize: 13, fontWeight: "900" },
  vs: { color: colors.muted, fontSize: 10, fontWeight: "900" },
  scoreCard: { alignItems: "center", backgroundColor: "#0b0d0c", marginBottom: 14, paddingVertical: 27 },
  scoreRow: { alignItems: "center", flexDirection: "row", gap: 22 },
  scorePrimary: { color: colors.primary, fontSize: 72, fontWeight: "900" },
  score: { color: colors.text, fontSize: 72, fontWeight: "900" },
  divider: { backgroundColor: colors.border, height: 60, width: 1 },
  setTitle: { color: colors.text, fontSize: 10, fontWeight: "900", marginTop: 18 },
  meta: { color: colors.muted, fontSize: 9, fontWeight: "800", marginTop: 8 },
  viewOnly: { backgroundColor: colors.surface, borderRadius: 7, color: colors.muted, fontSize: 9, fontWeight: "900", marginBottom: 12, padding: 12, textAlign: "center" },
  row: { flexDirection: "row", gap: 8, marginTop: 10 },
  flex: { flex: 1, paddingHorizontal: 5 },
});
