import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusPill } from "../../components/StatusPill";
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
};

const initialMatches: LiveMatch[] = [
  { id: "a1", court: "A1", venue: "Indiranagar Arena", teams: ["Falcons", "Smashers"], players: ["Aarav / Rohan", "Kabir / Neil"], score: [7, 5], server: "a", toss: "Falcons won and chose to serve", commentary: ["Falcons close the rally with a composed kitchen-line finish.", "Smashers answer with a patient return. Nobody is leaving early."] },
  { id: "b2", court: "B2", venue: "Whitefield Pickle Hub", teams: ["Spin Kings", "Dink Dynasty"], players: ["Meera / Anika", "Dev / Nikhil"], score: [10, 9], server: "b", toss: "Dink Dynasty won and chose to receive", commentary: ["Spin Kings reach set point with a neat cross-court angle.", "Dink Dynasty stay one rally away from making this dramatic."] },
  { id: "c3", court: "C3", venue: "Koramangala Court House", teams: ["Net Ninjas", "Rally Royals"], players: ["Ishaan / Varun", "Sara / Tara"], score: [2, 3], server: "a", toss: "Net Ninjas won and chose the south side", commentary: ["Rally Royals find the early lead. Small margin, large confidence."] },
];

export default function ScoringScreen() {
  const styles = useThemeStyles(createStyles);
  const { authorized } = useLocalSearchParams<{ authorized?: string }>();
  const isAuthorized = authorized === "true";
  const [matches, setMatches] = useState(initialMatches);
  const [selectedId, setSelectedId] = useState("a1");
  const [history, setHistory] = useState<Point[]>([]);
  const [pointNotice, setPointNotice] = useState("");
  const match = matches.find((item) => item.id === selectedId) ?? matches[0];

  function addPoint(player: Point) {
    if (!isAuthorized) return;
    const winner = player === "a" ? match.teams[0] : match.teams[1];
    const commentary = `${winner} take the point. Clean contact, louder scoreboard.`;
    setPointNotice(commentary);
    setTimeout(() => setPointNotice(""), 2800);
    setHistory((current) => [...current, player]);
    setMatches((current) => current.map((item) => {
      if (item.id !== match.id) return item;
      const score: [number, number] = player === "a" ? [item.score[0] + 1, item.score[1]] : [item.score[0], item.score[1] + 1];
      return { ...item, score, server: player, commentary: [commentary, ...item.commentary].slice(0, 4) };
    }));
  }

  function undo() {
    const player = history[history.length - 1];
    if (!isAuthorized || !player) return;
    setHistory((current) => current.slice(0, -1));
    setMatches((current) => current.map((item) => item.id === match.id
      ? { ...item, score: player === "a" ? [Math.max(0, item.score[0] - 1), item.score[1]] : [item.score[0], Math.max(0, item.score[1] - 1)] }
      : item));
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
          <Text style={styles.copy}>Follow simultaneous matches across venues. Tap a court to bring its live details into focus.</Text>
          {pointNotice ? <PointCommentaryToast message={pointNotice} /> : null}

          <SectionHeader title="ACTIVE COURTS" action={`${matches.length} LIVE`} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courtStrip}>
            {matches.map((item) => {
              const selected = item.id === match.id;
              return (
                <Pressable key={item.id} onPress={() => { setSelectedId(item.id); setHistory([]); }} style={[styles.courtCard, selected && styles.courtCardSelected]}>
                  <Text style={[styles.courtVenue, selected && styles.darkText]}>{item.venue}</Text>
                  <Text style={[styles.courtMeta, selected && styles.darkMuted]}>COURT {item.court}</Text>
                  <Text style={[styles.courtScore, selected && styles.darkText]}>{item.score[0]} - {item.score[1]}</Text>
                  <Text style={[styles.courtTeams, selected && styles.darkMuted]}>{item.teams.join(" / ")}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <CardContainer style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <View>
                <Text style={styles.venue}>{match.venue}</Text>
                <Text style={styles.meta}>COURT {match.court} / BEST OF 3</Text>
              </View>
              <StatusPill label="ON AIR" tone="danger" />
            </View>
            <View style={styles.scoreRow}>
              <Team name={match.teams[0]} players={match.players[0]} score={match.score[0]} serving={match.server === "a"} primary />
              <Text style={styles.vs}>VS</Text>
              <Team name={match.teams[1]} players={match.players[1]} score={match.score[1]} serving={match.server === "b"} />
            </View>
            <View style={styles.toss}>
              <Text style={styles.tossLabel}>TOSS</Text>
              <Text style={styles.tossText}>{match.toss}</Text>
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
            <PrimaryButton label={`${match.teams[0]} +1`} onPress={() => addPoint("a")} disabled={!isAuthorized} style={styles.flex} />
            <PrimaryButton label={`${match.teams[1]} +1`} onPress={() => addPoint("b")} disabled={!isAuthorized} variant="subtle" style={styles.flex} />
          </View>
          <View style={styles.row}>
            <PrimaryButton label="UNDO" onPress={undo} disabled={!isAuthorized || !history.length} variant="outline" style={styles.flex} />
            <PrimaryButton label="END SET" disabled={!isAuthorized} variant="outline" style={styles.flex} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
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
