import { useCallback, useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Animated, Easing, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusPill } from "../../components/StatusPill";
import { addScorecardPoint, apiErrorMessage, fetchLiveScore, undoScorecardPoint, type LiveScore, type MatchScorecard, type TeamCode } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

type Point = "a" | "b";
type LiveMatch = {
  id: string;
  court: string;
  venue: string;
  teams: [string, string];
  players: [string, string];
  score: [number, number];
  server: Point;
  toss: string;
  commentary: string[];
  status: string;
  currentSet: number;
  bestOf: number;
  revision: number;
};

const emptyMatch: LiveMatch = {
  id: "",
  court: "LIVE",
  venue: "Match court",
  teams: ["Team A", "Team B"],
  players: ["Awaiting roster", "Awaiting roster"],
  score: [0, 0],
  server: "a",
  toss: "Live scorecard connected by match ID",
  commentary: ["Scorecard is ready for backend updates."],
  status: "CREATED",
  currentSet: 1,
  bestOf: 3,
  revision: 0,
};

export default function ScoringScreen() {
  const styles = useThemeStyles(createStyles);
  const { authorized, matchId: matchIdParam } = useLocalSearchParams<{ authorized?: string; matchId?: string }>();
  const matchId = Array.isArray(matchIdParam) ? matchIdParam[0] : matchIdParam;
  const isAuthorized = authorized === "true";
  const [match, setMatch] = useState<LiveMatch>(() => ({ ...emptyMatch, id: matchId ?? "" }));
  const [loading, setLoading] = useState(Boolean(matchId));
  const [busyAction, setBusyAction] = useState<TeamCode | "UNDO" | "" >("");
  const [error, setError] = useState(matchId ? "" : "No match ID was provided. Go back to the invite and open scoring again.");
  const [pointNotice, setPointNotice] = useState("");

  const showNotice = useCallback((message: string) => {
    setPointNotice(message);
    setTimeout(() => setPointNotice(""), 2800);
  }, []);

  const applyLiveScore = useCallback((score: LiveScore) => {
    setMatch((current) => ({
      ...current,
      id: score.matchId,
      score: [numericScore(score.currentScore.A), numericScore(score.currentScore.B)],
      status: score.status,
      currentSet: score.currentSet ?? current.currentSet,
      revision: score.revision ?? current.revision,
      commentary: [`Live score synced at revision ${score.revision ?? 0}.`, ...current.commentary].slice(0, 4),
    }));
  }, []);

  const applyScorecard = useCallback((scorecard: MatchScorecard, action: string) => {
    const teamAPlayers = participantNames(scorecard, "A");
    const teamBPlayers = participantNames(scorecard, "B");
    const scoreA = numericScore(scorecard.scores.A);
    const scoreB = numericScore(scorecard.scores.B);
    setMatch((current) => ({
      ...current,
      id: scorecard.matchId,
      venue: scorecard.venue || current.venue,
      teams: [teamAPlayers.teamName, teamBPlayers.teamName],
      players: [teamAPlayers.players, teamBPlayers.players],
      score: [scoreA, scoreB],
      server: scoreA >= scoreB ? "a" : "b",
      toss: `Set ${scorecard.currentGameNumber} / best of ${scorecard.bestOf}`,
      status: scorecard.status,
      currentSet: scorecard.currentGameNumber,
      bestOf: scorecard.bestOf,
      revision: scorecard.revision,
      commentary: [action, ...current.commentary].slice(0, 4),
    }));
    showNotice(action);
  }, [showNotice]);

  useEffect(() => {
    if (!matchId) return;
    let mounted = true;
    setLoading(true);
    setError("");
    fetchLiveScore(matchId)
      .then((score) => {
        if (mounted) applyLiveScore(score);
      })
      .catch((cause) => {
        if (mounted) setError(apiErrorMessage(cause));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [applyLiveScore, matchId]);

  async function addPoint(teamCode: TeamCode) {
    if (!isAuthorized || !matchId || busyAction) return;
    setBusyAction(teamCode);
    setError("");
    try {
      const scorecard = await addScorecardPoint(matchId, teamCode);
      applyScorecard(scorecard, `${teamCode === "A" ? "Team A" : "Team B"} point recorded.`);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusyAction("");
    }
  }

  async function undo() {
    if (!isAuthorized || !matchId || busyAction) return;
    setBusyAction("UNDO");
    setError("");
    try {
      const scorecard = await undoScorecardPoint(matchId);
      applyScorecard(scorecard, "Last score action undone.");
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusyAction("");
    }
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Text onPress={() => router.replace("/(tabs)")} style={styles.back}>BACK</Text>
            <StatusPill label={isAuthorized ? "OFFICIAL MODE" : "LIVE VIEW"} tone={isAuthorized ? "gold" : "primary"} />
          </View>
          <Text style={styles.brand}>PICKELTON / LIVE</Text>
          <Text style={styles.title}>MATCH{"\n"}<Text style={styles.primary}>PULSE</Text></Text>
          <Text style={styles.copy}>Follow the live scorecard for this match. Authorized officials can record points from this screen.</Text>
          {pointNotice ? <PointCommentaryToast message={pointNotice} /> : null}
          {loading ? <Text style={styles.statusText}>LOADING SCORECARD...</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <SectionHeader title="ACTIVE COURTS" action={matchId ? "1 LIVE" : "NO MATCH"} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courtStrip}>
            <View style={[styles.courtCard, styles.courtCardSelected]}>
              <Text style={[styles.courtVenue, styles.darkText]}>{match.venue}</Text>
              <Text style={[styles.courtMeta, styles.darkMuted]}>MATCH {shortId(match.id)}</Text>
              <Text style={[styles.courtScore, styles.darkText]}>{match.score[0]} - {match.score[1]}</Text>
              <Text style={[styles.courtTeams, styles.darkMuted]}>{match.teams.join(" / ")}</Text>
            </View>
          </ScrollView>

          <CardContainer style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <View>
                <Text style={styles.venue}>{match.venue}</Text>
                <Text style={styles.meta}>SET {match.currentSet} / BEST OF {match.bestOf} / REV {match.revision}</Text>
              </View>
              <StatusPill label={match.status === "COMPLETED" ? "FINAL" : "ON AIR"} tone={match.status === "COMPLETED" ? "primary" : "danger"} />
            </View>
            <View style={styles.scoreRow}>
              <Team name={match.teams[0]} players={match.players[0]} score={match.score[0]} serving={match.server === "a"} primary />
              <Text style={styles.vs}>VS</Text>
              <Team name={match.teams[1]} players={match.players[1]} score={match.score[1]} serving={match.server === "b"} />
            </View>
            <View style={styles.toss}>
              <Text style={styles.tossLabel}>MATCH ID</Text>
              <Text style={styles.tossText}>{matchId || "Missing match ID"}</Text>
            </View>
          </CardContainer>

          <SectionHeader title="LIVE VIDEO" action="DEMO BROADCAST" />
          <LiveVideoDemo match={match} />

          {!isAuthorized ? <Text style={styles.viewOnly}>VIEW ONLY MODE / AUTHORIZED OFFICIALS CONTROL THE SCORE</Text> : null}

          <SectionHeader title="MATCH PERFORMANCE" />
          <CardContainer style={styles.performanceCard}>
            <Performance label="BALL POSSESSION" left="64%" right="36%" width="64%" />
            <Performance label="WINNERS" left="24" right="18" width="57%" />
            <Performance label="BREAK POINTS CONVERTED" left="4/6" right="2/5" width="66%" />
          </CardContainer>

          <SectionHeader title="LIVE COMMENTARY" />
          <CardContainer style={styles.commentaryCard}>
            {match.commentary.map((line, index) => (
              <View key={`${line}-${index}`} style={[styles.commentary, index > 0 && styles.commentaryBorder]}>
                <Text style={styles.commentaryTime}>{index === 0 ? "NOW" : `${index + 1}M`}</Text>
                <Text style={styles.commentaryText}>{line}</Text>
              </View>
            ))}
          </CardContainer>

          <SectionHeader title="SCORING CONTROLS" />
          <View style={styles.row}>
            <PrimaryButton label={`${match.teams[0]} +1`} onPress={() => addPoint("A")} disabled={!isAuthorized || !matchId || Boolean(busyAction) || loading} style={styles.flex} />
            <PrimaryButton label={`${match.teams[1]} +1`} onPress={() => addPoint("B")} disabled={!isAuthorized || !matchId || Boolean(busyAction) || loading} variant="subtle" style={styles.flex} />
          </View>
          <View style={styles.row}>
            <PrimaryButton label={busyAction === "UNDO" ? "UNDOING..." : "UNDO"} onPress={undo} disabled={!isAuthorized || !matchId || Boolean(busyAction) || loading || (match.score[0] === 0 && match.score[1] === 0)} variant="outline" style={styles.flex} />
            <PrimaryButton label="COMPLETE" disabled variant="outline" style={styles.flex} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function numericScore(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function shortId(id: string) {
  return id ? id.slice(0, 8).toUpperCase() : "MISSING";
}

function participantNames(scorecard: MatchScorecard, team: TeamCode) {
  const players = scorecard.participants.filter((participant) => participant.role === "PLAYER" && participant.team === team).map((participant) => participant.name);
  return {
    teamName: `Team ${team}`,
    players: players.length ? players.join(" / ") : `Team ${team} players`,
  };
}

function Performance({ label, left, right, width }: { label: string; left: string; right: string; width: `${number}%` }) {
  const styles = useThemeStyles(createStyles);
  return <View style={styles.performance}><View style={styles.performanceTop}><Text style={styles.performanceLeft}>{left}</Text><Text style={styles.performanceLabel}>{label}</Text><Text style={styles.performanceRight}>{right}</Text></View><View style={styles.performanceTrack}><View style={[styles.performanceFill, { width }]} /></View></View>;
}

function LiveVideoDemo({ match }: { match: LiveMatch }) {
  const styles = useThemeStyles(createStyles);
  const ballX = useRef(new Animated.Value(0)).current;
  const ballY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rally = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(ballX, { duration: 1150, easing: Easing.inOut(Easing.quad), toValue: 1, useNativeDriver: true }),
        Animated.timing(ballY, { duration: 575, easing: Easing.out(Easing.quad), toValue: 1, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ballX, { duration: 1150, easing: Easing.inOut(Easing.quad), toValue: 0, useNativeDriver: true }),
        Animated.timing(ballY, { duration: 575, easing: Easing.in(Easing.quad), toValue: 0, useNativeDriver: true }),
      ]),
    ]));
    rally.start();
    return () => rally.stop();
  }, [ballX, ballY]);

  return (
    <View style={styles.broadcast}>
      <View style={styles.broadcastTop}>
        <PulseDot />
        <Text style={styles.broadcastLive}>LIVE / COURT {match.court}</Text>
        <Text style={styles.broadcastQuality}>HD DEMO</Text>
      </View>
      <View style={styles.videoCourt}>
        <View style={styles.baselineTop} />
        <View style={styles.kitchenTop} />
        <View style={styles.net} />
        <View style={styles.kitchenBottom} />
        <View style={styles.baselineBottom} />
        <View style={styles.centerLine} />
        <View style={[styles.playerMarker, styles.playerOne]} />
        <View style={[styles.playerMarker, styles.playerTwo]} />
        <View style={[styles.playerMarker, styles.playerThree]} />
        <View style={[styles.playerMarker, styles.playerFour]} />
        <Animated.View style={[styles.videoBall, { transform: [{ translateX: ballX.interpolate({ inputRange: [0, 1], outputRange: [38, 226] }) }, { translateY: ballY.interpolate({ inputRange: [0, 1], outputRange: [108, 46] }) }] }]} />
      </View>
      <View style={styles.broadcastBottom}>
        <Text style={styles.broadcastScore}>{match.teams[0]}  {match.score[0]}  -  {match.score[1]}  {match.teams[1]}</Text>
        <Text style={styles.broadcastCaption}>SIMULATED LIVE COURT FEED</Text>
      </View>
    </View>
  );
}

function PointCommentaryToast({ message }: { message: string }) {
  const styles = useThemeStyles(createStyles);
  const slide = useRef(new Animated.Value(-8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, { duration: 220, toValue: 0, useNativeDriver: true }),
      Animated.timing(opacity, { duration: 220, toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [opacity, slide]);
  return <Animated.View style={[styles.pointToast, { opacity, transform: [{ translateY: slide }] }]}><Text style={styles.pointToastLabel}>LIVE COMMENTARY</Text><Text style={styles.pointToastText}>{message}</Text></Animated.View>;
}

function PulseDot() {
  const styles = useThemeStyles(createStyles);
  const pulse = useRef(new Animated.Value(0.82)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { duration: 680, toValue: 1.25, useNativeDriver: true }),
      Animated.timing(pulse, { duration: 680, toValue: 0.82, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [pulse]);
  return <Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />;
}

function Team({ name, players, score, serving, primary = false }: { name: string; players: string; score: number; serving: boolean; primary?: boolean }) {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.team}>
      <Text style={styles.teamName}>{name}</Text>
      <Text style={styles.players}>{players}</Text>
      <Text style={[styles.bigScore, primary && styles.primary]}>{score}</Text>
      <Text style={[styles.server, serving && styles.serverActive]}>{serving ? "SERVING" : "READY"}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 30 },
  topRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  back: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  brand: { color: colors.primary, fontSize: 14, fontStyle: "italic", fontWeight: "900", marginTop: 22 },
  title: { color: colors.text, fontSize: 38, fontStyle: "italic", fontWeight: "900", lineHeight: 37, marginTop: 14 },
  primary: { color: colors.primary },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 10 },
  statusText: { color: colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.7, marginTop: 12 },
  error: { borderColor: colors.danger, borderRadius: 8, borderWidth: 1, color: colors.danger, fontSize: 10, fontWeight: "800", lineHeight: 16, marginTop: 12, padding: 12 },
  pointToast: { backgroundColor: colors.primarySoft, borderColor: colors.primaryDim, borderRadius: 8, borderWidth: 1, marginTop: 14, padding: 12 }, pointToastLabel: { color: colors.primary, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 }, pointToastText: { color: colors.text, fontSize: 11, lineHeight: 16, marginTop: 5 },
  courtStrip: { gap: 9, paddingBottom: 2 },
  courtCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, padding: 13, width: 178 },
  courtCardSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  courtVenue: { color: colors.text, fontSize: 11, fontWeight: "900" },
  courtMeta: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.6, marginTop: 5 },
  courtScore: { color: colors.primary, fontSize: 26, fontWeight: "900", marginTop: 14 },
  courtTeams: { color: colors.muted, fontSize: 9, fontWeight: "800", marginTop: 5 },
  darkText: { color: colors.background },
  darkMuted: { color: "#405020" },
  scoreCard: { backgroundColor: colors.raised, borderTopColor: colors.primary, borderTopWidth: 3, marginTop: 15 },
  scoreHeader: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  venue: { color: colors.text, fontSize: 15, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.7, marginTop: 6 },
  scoreRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  team: { alignItems: "center", flex: 1 },
  teamName: { color: colors.text, fontSize: 12, fontWeight: "900", textAlign: "center" },
  players: { color: colors.muted, fontSize: 9, marginTop: 5, textAlign: "center" },
  bigScore: { color: colors.text, fontSize: 62, fontWeight: "900", lineHeight: 70, marginTop: 5 },
  vs: { color: colors.muted, fontSize: 10, fontWeight: "900" },
  server: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  serverActive: { color: colors.primary },
  toss: { backgroundColor: colors.background, borderColor: colors.border, borderRadius: 8, borderWidth: 1, marginTop: 20, padding: 12 },
  tossLabel: { color: colors.primary, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  tossText: { color: colors.text, fontSize: 11, fontWeight: "800", marginTop: 5 },
  broadcast: { backgroundColor: "#10190d", borderColor: colors.primaryDim, borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  broadcastTop: { alignItems: "center", backgroundColor: colors.primarySoft, flexDirection: "row", gap: 7, paddingHorizontal: 12, paddingVertical: 9 },
  liveDot: { backgroundColor: colors.danger, borderRadius: 5, height: 8, width: 8 },
  broadcastLive: { color: colors.text, flex: 1, fontSize: 9, fontWeight: "900", letterSpacing: 0.6 },
  broadcastQuality: { color: colors.primary, fontSize: 8, fontWeight: "900" },
  videoCourt: { backgroundColor: "#3e651c", height: 182, overflow: "hidden", position: "relative" },
  baselineTop: { borderTopColor: colors.primary, borderTopWidth: 2, left: 18, position: "absolute", right: 18, top: 17 },
  baselineBottom: { borderBottomColor: colors.primary, borderBottomWidth: 2, bottom: 17, left: 18, position: "absolute", right: 18 },
  kitchenTop: { borderTopColor: colors.primary, borderTopWidth: 1, left: 18, position: "absolute", right: 18, top: 63 },
  kitchenBottom: { borderBottomColor: colors.primary, borderBottomWidth: 1, bottom: 63, left: 18, position: "absolute", right: 18 },
  net: { backgroundColor: colors.text, height: 2, left: 10, opacity: 0.9, position: "absolute", right: 10, top: 90 },
  centerLine: { backgroundColor: colors.primary, bottom: 17, left: "50%", position: "absolute", top: 17, width: 1 },
  playerMarker: { backgroundColor: colors.text, borderColor: colors.background, borderRadius: 7, borderWidth: 2, height: 14, position: "absolute", width: 14 },
  playerOne: { bottom: 31, left: 65 }, playerTwo: { bottom: 31, right: 65 }, playerThree: { left: 65, top: 31 }, playerFour: { right: 65, top: 31 },
  videoBall: { backgroundColor: colors.primary, borderColor: "#e5ff80", borderRadius: 6, borderWidth: 1, height: 11, left: 0, position: "absolute", top: 0, width: 11 },
  broadcastBottom: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 10 },
  broadcastScore: { color: colors.text, fontSize: 11, fontWeight: "900", textAlign: "center" },
  broadcastCaption: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.7, marginTop: 5, textAlign: "center" },
  performanceCard: { gap: 18 },
  performance: { gap: 8 },
  performanceTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  performanceLeft: { color: colors.primary, fontSize: 18, fontWeight: "900", width: 45 },
  performanceLabel: { color: colors.muted, flex: 1, fontSize: 9, fontWeight: "900", letterSpacing: 0.5, textAlign: "center" },
  performanceRight: { color: colors.text, fontSize: 18, fontWeight: "900", textAlign: "right", width: 45 },
  performanceTrack: { backgroundColor: colors.elevated, borderRadius: 4, height: 7, overflow: "hidden" },
  performanceFill: { backgroundColor: colors.primary, borderRadius: 4, height: 7 },
  viewOnly: { backgroundColor: colors.primarySoft, borderColor: colors.primaryDim, borderRadius: 8, borderWidth: 1, color: colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.5, marginTop: 12, padding: 12, textAlign: "center" },
  commentaryCard: { paddingVertical: 5 },
  commentary: { flexDirection: "row", gap: 10, paddingVertical: 11 },
  commentaryBorder: { borderTopColor: colors.border, borderTopWidth: 1 },
  commentaryTime: { color: colors.primary, fontSize: 8, fontWeight: "900", width: 28 },
  commentaryText: { color: colors.muted, flex: 1, fontSize: 11, lineHeight: 16 },
  row: { flexDirection: "row", gap: 9, marginTop: 9 },
  flex: { flex: 1, paddingHorizontal: 5 },
});