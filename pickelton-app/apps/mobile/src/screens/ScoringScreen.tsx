// pickelton-app/apps/mobile/src/screens/ScoringScreen.tsx
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { CardContainer } from "../components/CardContainer";
import { Eye, ShieldCheck } from "../components/icons";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import type { LocalMatch } from "../types/matchFlow";
import { colors } from "../theme/colors";

type Point = "a" | "b";
type SetResult = { a: number; b: number };

export function ScoringScreen({ match, isAuthorized, onBack, onLive, onEndMatch }: {
  match: LocalMatch;
  isAuthorized: boolean;
  onBack: () => void;
  onLive: () => void;
  onEndMatch: () => void;
}) {
  const [playerA, setPlayerA] = useState(18);
  const [playerB, setPlayerB] = useState(14);
  const [sets, setSets] = useState<SetResult[]>([{ a: 11, b: 9 }]);
  const [history, setHistory] = useState<Point[]>([]);
  const [ended, setEnded] = useState(false);

  function addPoint(player: Point) {
    if (!isAuthorized || ended) return;
    onLive();
    setHistory((points) => [...points, player]);
    if (player === "a") setPlayerA((score) => score + 1);
    else setPlayerB((score) => score + 1);
  }

  function undoPoint() {
    if (!isAuthorized || history.length === 0 || ended) return;
    const previous = history[history.length - 1];
    setHistory((points) => points.slice(0, -1));
    if (previous === "a") setPlayerA((score) => Math.max(0, score - 1));
    else setPlayerB((score) => Math.max(0, score - 1));
  }

  function endSet() {
    if (!isAuthorized || ended) return;
    setSets((current) => [...current, { a: playerA, b: playerB }]);
    setPlayerA(0);
    setPlayerB(0);
    setHistory([]);
    onLive();
  }

  function endMatch() {
    if (!isAuthorized || ended) return;
    setEnded(true);
    onEndMatch();
  }

  const status = ended || match.status === "completed" ? "COMPLETED" : match.status === "live" ? "LIVE" : "READY";

  return (
    <ScreenShell>
      <AppHeader onBack={onBack} />
      <View style={styles.liveBadge}><Text style={styles.liveText}>{status}</Text></View>
      <View style={styles.names}>
        <Player name={match.players[0] ?? "C. HENDERSON"} rank="RANK #04" />
        <Text style={styles.vs}>VS</Text>
        <Player name={match.players[1] ?? "M. ARISAKA"} rank="RANK #12" />
      </View>
      <CardContainer style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreActive}>{playerA}</Text>
          <View style={styles.divider} />
          <Text style={styles.score}>{playerB}</Text>
        </View>
        <Text style={styles.setTitle}>SET {sets.length + 1}</Text>
        <View style={styles.setPills}>
          {sets.map((result, index) => (
            <Text key={`${result.a}-${result.b}-${index}`} style={styles.setPill}>SET {index + 1}: {result.a}-{result.b}</Text>
          ))}
          <Text style={[styles.setPill, styles.current]}>CURRENT: {playerA}-{playerB}</Text>
        </View>
      </CardContainer>
      <CardContainer style={styles.infoCard}>
        <Text style={styles.label}>SERVE STATUS</Text>
        <Text style={styles.green}>PLAYER A SERVING</Text>
        <Eye size={18} color={colors.lime} />
      </CardContainer>
      <View style={styles.stats}>
        <CardContainer style={styles.stat}><Text style={styles.label}>TOTAL FAULTS</Text><Text style={styles.statValue}>04 / 02</Text></CardContainer>
        <CardContainer style={styles.stat}><Text style={styles.label}>WIN PROBABILITY</Text><Text style={styles.statValue}>62% EST</Text></CardContainer>
      </View>
      {!isAuthorized ? (
        <View style={styles.locked}><ShieldCheck size={15} color={colors.muted} /><Text style={styles.lockText}>VIEW ONLY MODE - AUTHORIZED OFFICIALS ONLY</Text></View>
      ) : null}
      <View style={styles.pointActions}>
        <PrimaryButton label={`POINT ${match.players[0] ?? "A"} +1`} onPress={() => addPoint("a")} disabled={!isAuthorized || ended} style={styles.pointButton} />
        <PrimaryButton label={`POINT ${match.players[1] ?? "B"} +1`} onPress={() => addPoint("b")} disabled={!isAuthorized || ended} variant="subtle" style={styles.pointButton} />
      </View>
      <View style={styles.controls}>
        <Control label="UNDO POINT" onPress={undoPoint} disabled={!isAuthorized || history.length === 0 || ended} />
        <Control label="END SET" onPress={endSet} disabled={!isAuthorized || ended} />
        <Control label="END MATCH" onPress={endMatch} disabled={!isAuthorized || ended} />
      </View>
    </ScreenShell>
  );
}

function Player({ name, rank }: { name: string; rank: string }) {
  return <View style={styles.player}><Text style={styles.playerName}>{name.toUpperCase()}</Text><Text style={styles.rank}>{rank}</Text></View>;
}

function Control({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.control, disabled && styles.disabled]}><Text style={styles.controlText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  liveBadge: { alignSelf: "center", backgroundColor: colors.limeDim, borderRadius: 14, marginBottom: 23, paddingHorizontal: 14, paddingVertical: 6 },
  liveText: { color: colors.lime, fontSize: 10, fontWeight: "900" },
  names: { alignItems: "center", flexDirection: "row", justifyContent: "space-around", marginBottom: 18 },
  player: { alignItems: "center" },
  playerName: { color: colors.text, fontSize: 13, fontWeight: "900" },
  rank: { color: colors.muted, fontSize: 9, fontWeight: "700", marginTop: 6 },
  vs: { color: colors.muted, fontSize: 10, fontWeight: "900" },
  scoreCard: { alignItems: "center", backgroundColor: "#0b0d0c", marginBottom: 16, paddingVertical: 25 },
  scoreRow: { alignItems: "center", flexDirection: "row", gap: 22 },
  scoreActive: { color: colors.lime, fontSize: 72, fontWeight: "900" },
  score: { color: colors.text, fontSize: 72, fontWeight: "900" },
  divider: { backgroundColor: colors.border, height: 62, width: 1 },
  setTitle: { color: colors.text, fontSize: 10, fontWeight: "900", marginBottom: 11, marginTop: 18 },
  setPills: { flexDirection: "row", flexWrap: "wrap", gap: 7, justifyContent: "center" },
  setPill: { backgroundColor: colors.raised, borderRadius: 4, color: colors.text, fontSize: 9, fontWeight: "800", paddingHorizontal: 8, paddingVertical: 6 },
  current: { color: colors.lime },
  infoCard: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between", marginBottom: 10 },
  label: { color: colors.muted, fontSize: 8, fontWeight: "900" },
  green: { color: colors.lime, flex: 1, fontSize: 11, fontWeight: "900", marginLeft: 6 },
  stats: { flexDirection: "row", gap: 10, marginBottom: 12 },
  stat: { flex: 1, gap: 9, padding: 13 },
  statValue: { color: colors.text, fontSize: 12, fontWeight: "900" },
  locked: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 7, flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 13, padding: 12 },
  lockText: { color: colors.muted, fontSize: 9, fontWeight: "900" },
  pointActions: { flexDirection: "row", gap: 10, marginTop: 6 },
  pointButton: { flex: 1, minHeight: 58, paddingHorizontal: 5 },
  controls: { flexDirection: "row", gap: 9, marginTop: 13 },
  control: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 6, flex: 1, justifyContent: "center", minHeight: 49 },
  controlText: { color: colors.text, fontSize: 8, fontWeight: "900" },
  disabled: { opacity: 0.4 },
});
