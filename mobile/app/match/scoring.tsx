import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { PulseDot } from "../../components/Brand";
import { Button } from "../../components/Button";
import { EmptyState, LoadingState } from "../../components/EmptyState";
import { IconButton } from "../../components/IconButton";
import { Notice } from "../../components/Notice";
import { Screen } from "../../components/Screen";
import { addScorecardPoint, apiErrorMessage, completeScorecard, fetchLiveScore, undoScorecardPoint, type LiveScore, type MatchScorecard, type TeamCode } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

type Board = {
  teams: [string, string];
  score: [number, number];
  games: Array<[number, number]>;
  status: string;
  currentSet: number;
  bestOf: number;
  pointsToWin: number | null;
};

const emptyBoard: Board = { teams: ["Team A", "Team B"], score: [0, 0], games: [], status: "CREATED", currentSet: 1, bestOf: 3, pointsToWin: null };

export default function ScoringScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const { authorized, matchId: matchIdParam } = useLocalSearchParams<{ authorized?: string; matchId?: string }>();
  const matchId = Array.isArray(matchIdParam) ? matchIdParam[0] : matchIdParam;
  const canScore = authorized === "true";
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [loading, setLoading] = useState(Boolean(matchId));
  const [busy, setBusy] = useState<TeamCode | "UNDO" | "COMPLETE" | "">("");
  const [error, setError] = useState("");

  const applyLiveScore = useCallback((live: LiveScore) => {
    setBoard((current) => ({
      ...current,
      score: [numeric(live.currentScore?.A), numeric(live.currentScore?.B)],
      games: completedGames(live.setSummary),
      status: live.status,
      currentSet: live.currentSet ?? current.currentSet,
    }));
  }, []);

  const applyScorecard = useCallback((card: MatchScorecard) => {
    setBoard((current) => ({
      ...current,
      teams: [teamName(card, "A"), teamName(card, "B")],
      score: [numeric(card.scores.A), numeric(card.scores.B)],
      status: card.status,
      currentSet: card.currentGameNumber,
      bestOf: card.bestOf,
      pointsToWin: card.pointsToWin,
    }));
  }, []);

  const load = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    setError("");
    try {
      applyLiveScore(await fetchLiveScore(matchId));
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [applyLiveScore, matchId]);

  useEffect(() => { void load(); }, [load]);

  async function act(kind: TeamCode | "UNDO" | "COMPLETE", request: () => Promise<MatchScorecard>) {
    if (!canScore || !matchId || busy) return;
    setBusy(kind);
    setError("");
    try {
      applyScorecard(await request());
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy("");
    }
  }

  function confirmComplete() {
    Alert.alert("Finish match?", "The result goes to both sides to confirm before it counts toward ratings.", [
      { style: "cancel", text: "Keep scoring" },
      { onPress: () => act("COMPLETE", () => completeScorecard(matchId!)), text: "Finish match" },
    ]);
  }

  const done = board.status === "COMPLETED";
  const minimise = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)"));

  if (!matchId) {
    return (
      <Screen>
        <IconButton icon="chevron-down" label="Close scoreboard" onPress={minimise} />
        <EmptyState action="Back to Home" copy="Open the scorer from a match invitation." icon="alert-circle-outline" onAction={() => router.replace("/(tabs)")} title="No match selected" />
      </Screen>
    );
  }

  const gamePoint = (mine: number, theirs: number) => board.pointsToWin != null && !done && mine >= board.pointsToWin - 1 && mine > theirs;
  const chips = Array.from({ length: board.bestOf }, (_, index) => {
    const game = board.games[index];
    if (game) return { label: `G${index + 1}  ${game[0]}–${game[1]}`, tone: game[0] > game[1] ? "a" : "b" };
    if (!done && index + 1 === board.currentSet) return { label: `Game ${index + 1} · live`, tone: "live" };
    return { label: `Game ${index + 1}`, tone: "next" };
  });

  return (
    <Screen contentStyle={styles.content} scroll={false}>
      <View style={styles.header}>
        <IconButton icon="chevron-down" label="Minimise scoreboard" onPress={minimise} />
        <View style={styles.headerCopy}>
          <View style={styles.status}>
            {!done ? <PulseDot color={colors.hot} /> : null}
            <Text style={styles.statusText}>{done ? "Final" : `Live · Game ${board.currentSet} of ${board.bestOf}`}</Text>
          </View>
          <Text style={styles.meta}>{board.pointsToWin ? `To ${board.pointsToWin}` : "Live scorecard"}{canScore ? " · you're scoring" : " · view only"}</Text>
        </View>
        <IconButton icon="refresh" label="Refresh score" onPress={load} />
      </View>

      <View style={styles.chips}>
        {chips.map((chip) => (
          <View key={chip.label} style={[styles.chip, chip.tone === "a" && { backgroundColor: colors.acc, borderColor: colors.acc }, chip.tone === "b" && { backgroundColor: colors.blu, borderColor: colors.blu }, chip.tone === "live" && { borderColor: colors.text }]}>
            <Text style={[styles.chipText, chip.tone === "a" && { color: colors.onAcc }, chip.tone === "b" && { color: colors.onBlu }, chip.tone === "next" && { color: colors.muted }]}>{chip.label}</Text>
          </View>
        ))}
      </View>

      <Notice message={error} />
      {loading ? <LoadingState label="Loading scorecard" /> : null}

      <ScorePanel
        disabled={!canScore || done || Boolean(busy)}
        flag={gamePoint(board.score[0], board.score[1]) ? "Game point" : ""}
        name={board.teams[0]}
        onPress={() => act("A", () => addScorecardPoint(matchId, "A"))}
        primary
        score={board.score[0]}
      />
      <ScorePanel
        disabled={!canScore || done || Boolean(busy)}
        flag={gamePoint(board.score[1], board.score[0]) ? "Game point" : ""}
        name={board.teams[1]}
        onPress={() => act("B", () => addScorecardPoint(matchId, "B"))}
        score={board.score[1]}
      />

      {canScore ? (
        <View style={styles.controls}>
          <Button disabled={done || (board.score[0] === 0 && board.score[1] === 0)} icon="arrow-undo" label="Undo" loading={busy === "UNDO"} onPress={() => act("UNDO", () => undoScorecardPoint(matchId))} size="md" style={styles.flex} variant="outline" />
          <Button disabled={done} label={done ? "Match saved" : "Finish match"} loading={busy === "COMPLETE"} onPress={confirmComplete} size="md" style={styles.flex} variant="dark" />
        </View>
      ) : (
        <View style={styles.viewOnly}>
          <Ionicons color={colors.muted} name="eye-outline" size={18} />
          <Text style={styles.viewOnlyText}>View only. The match officials record points.</Text>
        </View>
      )}
    </Screen>
  );
}

function ScorePanel({ name, score, flag, primary = false, disabled, onPress }: { name: string; score: number; flag: string; primary?: boolean; disabled: boolean; onPress: () => void }) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const ink = primary ? colors.onAcc : colors.text;
  return (
    <Pressable
      accessibilityHint={disabled ? undefined : "Adds a point"}
      accessibilityLabel={`${name}, ${score} points`}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.panel, primary ? styles.panelPrimary : styles.panelSecondary, pressed && styles.pressed]}
    >
      <Text numberOfLines={2} style={[styles.panelName, { color: ink }]}>{name}</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.panelScore, { color: ink }]}>{score}</Text>
      {flag ? <Text style={[styles.panelFlag, { color: primary ? colors.onAcc : colors.bluInk }]}>{flag.toUpperCase()}</Text> : null}
    </Pressable>
  );
}

function numeric(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

// setSummary rows look like { A: 11, B: 8 }; anything else is ignored.
function completedGames(summary: Array<Record<string, unknown>> | undefined): Array<[number, number]> {
  return (summary ?? [])
    .filter((game) => typeof game.A === "number" && typeof game.B === "number")
    .map((game) => [game.A as number, game.B as number]);
}

function teamName(card: MatchScorecard, team: TeamCode) {
  const names = card.participants.filter((person) => person.role === "PLAYER" && person.team === team).map((person) => person.name.split(" ")[0]);
  return names.length ? names.join(" & ") : `Team ${team}`;
}

const createStyles = (colors: ThemeColors) => ({
  content: { gap: 12, paddingHorizontal: 16 },
  header: { alignItems: "center", flexDirection: "row", gap: 10 },
  headerCopy: { alignItems: "center", flex: 1, gap: 2 },
  status: { alignItems: "center", flexDirection: "row", gap: 6 },
  statusText: { color: colors.hotInk, fontFamily: fonts.heavy, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  meta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  chip: { borderColor: colors.line, borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: colors.text, fontFamily: fonts.heavy, fontSize: 12 },
  panel: { alignItems: "center", borderRadius: 28, flex: 1, justifyContent: "center", overflow: "hidden", padding: 16 },
  panelPrimary: { backgroundColor: colors.acc },
  panelSecondary: { backgroundColor: colors.s1, borderColor: colors.line, borderWidth: 1.5 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  panelName: { fontFamily: fonts.heavy, fontSize: 14, left: 18, lineHeight: 18, position: "absolute", top: 16 },
  panelScore: { fontFamily: fonts.display, fontSize: 150, lineHeight: 150 },
  panelFlag: { bottom: 16, fontFamily: fonts.heavy, fontSize: 12, letterSpacing: 1.2, position: "absolute" },
  controls: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  viewOnly: { alignItems: "center", backgroundColor: colors.s2, borderRadius: 16, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 48, paddingHorizontal: 12 },
  viewOnlyText: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 13 },
});
