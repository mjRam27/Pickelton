import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Animated, Easing, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { CardContainer } from "../../components/CardContainer";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusPill } from "../../components/StatusPill";
import { getCurrentUser } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

const liveMatches = [
  { court: "A1", venue: "Indiranagar Arena", teams: "Falcons vs Smashers", score: "7 - 5", status: "LIVE" },
  { court: "B2", venue: "Whitefield Pickle Hub", teams: "Spin Kings vs Dink Dynasty", score: "10 - 9", status: "SET POINT" },
];

export default function HomeScreen() {
  const firstName = getCurrentUser()?.name.split(" ")[0] ?? "Player";
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAlertOpen(true), 850);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <AppHeader eyebrow="BENGALURU MATCHDAY" title={`Good evening, ${firstName}`} />
          <Pressable onPress={() => setAlertOpen(true)} style={({ pressed }) => [styles.liveNotice, pressed && styles.pressed]}>
            <PulseIcon />
            <View style={styles.noticeCopy}><Text style={styles.noticeTitle}>3 COURTS ARE LIVE NOW</Text><Text style={styles.noticeText}>Indiranagar, Whitefield, and Koramangala</Text></View>
            <Ionicons color={colors.primary} name="chevron-forward" size={16} />
          </Pressable>

          <SectionHeader title="LIVE SCORES" action="VIEW ALL" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.liveList}>
            {liveMatches.map((match) => (
              <Pressable
                key={match.court}
                onPress={() => router.push({ pathname: "/match/scoring", params: { authorized: "false" } })}
                style={({ pressed }) => [styles.liveCard, pressed && styles.pressed]}
              >
                <View style={styles.liveTop}>
                  <View>
                    <Text style={styles.venue}>{match.venue}</Text>
                    <Text style={styles.court}>COURT {match.court}</Text>
                  </View>
                  <StatusPill label={match.status} tone={match.status === "LIVE" ? "danger" : "gold"} />
                </View>
                <View style={styles.matchRow}>
                  <Text style={styles.teams}>{match.teams}</Text>
                  <Text style={styles.score}>{match.score}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <SectionHeader title="HEADLINES" />
          <CardContainer style={styles.hero}>
            <StatusPill label="EXCLUSIVE" />
            <Text style={styles.heroTitle}>OWN THE{"\n"}<Text style={styles.primary}>COURT.</Text></Text>
            <Text style={styles.copy}>Build matches, follow live courts, and keep your club moving from one premium matchday home.</Text>
            <View style={styles.heroActions}>
              <PrimaryButton label="CREATE MATCH" onPress={() => router.push("/match/create")} style={styles.heroButton} />
              <PrimaryButton label="LIVE SCORES" variant="outline" onPress={() => router.push({ pathname: "/match/scoring", params: { authorized: "false" } })} style={styles.heroButton} />
            </View>
          </CardContainer>

          <SectionHeader title="UPCOMING MATCHES" action="FULL SCHEDULE" />
          <CardContainer style={styles.schedule}>
            <Schedule teams="Wolves vs Stallions" league="Pro League / Finals" time="TOMORROW / 19:30" live />
            <Schedule teams="Titans vs Falcons" league="Eastern Division" time="JUN 14 / 21:00" />
            <Schedule teams="Cobras vs Panthers" league="Western Cup" time="JUN 15 / 18:00" />
          </CardContainer>

          <SectionHeader title="QUICK ACTIONS" />
          <View style={styles.grid}>
            <Action icon="people-outline" label="CLUBS" copy="Discover communities" onPress={() => router.push("/(tabs)/clubs")} />
            <Action icon="chatbubbles-outline" label="COMMUNITY" copy="Catch the player feed" onPress={() => router.push("/(tabs)/community")} />
            <Action icon="shield-checkmark-outline" label="HOST" copy="Apply to run events" onPress={() => router.push("/host/apply")} />
            <Action icon="pulse-outline" label="SCORER" copy="Open match control" onPress={() => router.push({ pathname: "/match/scoring", params: { authorized: "false" } })} />
          </View>

          <SectionHeader title="YOUR VELOCITY" />
          <CardContainer style={styles.velocity}>
            <View style={styles.velocityRow}>
              <View>
                <Text style={styles.metric}>1,240 <Text style={styles.smallPrimary}>XP</Text></Text>
                <Text style={styles.copy}>Top 5% of players in Bengaluru</Text>
              </View>
              <StatusPill label="RISING" />
            </View>
            <View style={styles.progress}><View style={styles.progressFill} /></View>
          </CardContainer>
        </ScrollView>
      </SafeAreaView>
      <MatchdayPopup onClose={() => setAlertOpen(false)} visible={alertOpen} />
    </View>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  return <View style={styles.metricCard}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function Schedule({ teams, league, time, live = false }: { teams: string; league: string; time: string; live?: boolean }) {
  const styles = useThemeStyles(createStyles);
  return <View style={styles.scheduleRow}><View style={styles.scheduleDots}><View style={[styles.scheduleDot, live && styles.scheduleDotActive]} /><View style={styles.scheduleDot} /></View><View style={styles.scheduleCopy}><Text style={styles.scheduleTeams}>{teams}</Text><Text style={styles.scheduleLeague}>{league}</Text></View><Text style={[styles.scheduleTime, live && styles.primary]}>{time}</Text></View>;
}

function Action({ icon, label, copy, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; copy: string; onPress: () => void }) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  function animate(toValue: number) { Animated.spring(scale, { friction: 6, tension: 180, toValue, useNativeDriver: true }).start(); }
  return (
    <Animated.View style={[styles.action, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={() => animate(0.97)} onPressOut={() => animate(1)} style={({ pressed }) => [styles.actionPressable, pressed && styles.pressed]}>
        <View style={styles.actionIcon}><Ionicons color={colors.primary} name={icon} size={18} /></View>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionCopy}>{copy}</Text>
        <View style={styles.actionFooter}><Text style={styles.arrow}>OPEN</Text><Ionicons color={colors.primary} name="arrow-forward" size={13} /></View>
      </Pressable>
    </Animated.View>
  );
}

function PulseIcon() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(0.82)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(scale, { duration: 760, easing: Easing.inOut(Easing.quad), toValue: 1.14, useNativeDriver: true }),
      Animated.timing(scale, { duration: 760, easing: Easing.inOut(Easing.quad), toValue: 0.82, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [scale]);
  return <Animated.View style={[styles.noticeIcon, { transform: [{ scale }] }]}><Ionicons color={colors.primary} name="radio-outline" size={16} /></Animated.View>;
}

function MatchdayPopup({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  function openScores() {
    onClose();
    router.push({ pathname: "/match/scoring", params: { authorized: "false" } });
  }
  return <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
    <View style={styles.popupBackdrop}>
      <View style={styles.popup}>
        <View style={styles.popupTop}><View style={styles.popupIcon}><Ionicons color={colors.primary} name="location-outline" size={19} /></View><View style={styles.popupHeading}><Text style={styles.popupEyebrow}>MATCHDAY RADAR</Text><Text style={styles.popupTitle}>Courts are calling.</Text></View><Pressable accessibilityLabel="Close live match alert" onPress={onClose} style={styles.close}><Ionicons color={colors.muted} name="close" size={18} /></Pressable></View>
        <Text style={styles.popupCopy}>Three matches are happening around Bengaluru right now. Pick a court and drop into the action.</Text>
        <View style={styles.popupMatches}>{liveMatches.map((match) => <View key={match.court} style={styles.popupMatch}><View style={styles.popupCourt}><Text style={styles.popupCourtText}>{match.court}</Text></View><View style={styles.popupMatchCopy}><Text style={styles.popupVenue}>{match.venue}</Text><Text style={styles.popupTeams}>{match.teams}</Text></View><Text style={styles.popupScore}>{match.score}</Text></View>)}</View>
        <PrimaryButton icon="radio-outline" label="OPEN LIVE SCORES" onPress={openScores} />
        <Pressable onPress={onClose} style={styles.later}><Text style={styles.laterText}>NOT NOW</Text></Pressable>
      </View>
    </View>
  </Modal>;
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 30 },
  liveNotice: { alignItems: "center", backgroundColor: colors.primarySoft, borderColor: colors.primaryDim, borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 18, padding: 11 },
  noticeIcon: { alignItems: "center", backgroundColor: colors.background, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  noticeCopy: { flex: 1 }, noticeTitle: { color: colors.text, fontSize: 10, fontWeight: "900", letterSpacing: 0.5 }, noticeText: { color: colors.muted, fontSize: 10, marginTop: 4 },
  hero: { backgroundColor: colors.raised, gap: 12, marginTop: 22, paddingVertical: 20 },
  heroTitle: { color: colors.text, fontSize: 39, fontStyle: "italic", fontWeight: "900", lineHeight: 38 },
  primary: { color: colors.primary },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  heroActions: { flexDirection: "row", gap: 9, marginTop: 4 },
  heroButton: { flex: 1, paddingHorizontal: 6 },
  metrics: { flexDirection: "row", gap: 8, marginTop: 12 },
  metricCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, flex: 1, padding: 12 },
  metricValue: { color: colors.text, fontSize: 23, fontWeight: "900" },
  metricLabel: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.8, marginTop: 5 },
  liveList: { gap: 9, paddingBottom: 2 },
  liveCard: { backgroundColor: colors.raised, borderColor: colors.border, borderRadius: 12, borderTopColor: colors.primary, borderTopWidth: 3, borderWidth: 1, padding: 14, width: 270 },
  liveTop: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  venue: { color: colors.text, fontSize: 13, fontWeight: "900" },
  court: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 0.8, marginTop: 5 },
  matchRow: { alignItems: "flex-end", flexDirection: "row", gap: 8, justifyContent: "space-between", marginTop: 18 },
  teams: { color: colors.muted, flex: 1, fontSize: 11, fontWeight: "800" },
  score: { color: colors.primary, fontSize: 24, fontWeight: "900" },
  schedule: { padding: 0 },
  scheduleRow: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 12, minHeight: 74, paddingHorizontal: 14 },
  scheduleDots: { flexDirection: "row" },
  scheduleDot: { backgroundColor: colors.elevated, borderRadius: 11, height: 22, marginLeft: -4, width: 22 },
  scheduleDotActive: { backgroundColor: colors.primary },
  scheduleCopy: { flex: 1 },
  scheduleTeams: { color: colors.text, fontSize: 12, fontWeight: "900" },
  scheduleLeague: { color: colors.muted, fontSize: 9, marginTop: 4 },
  scheduleTime: { color: colors.muted, fontSize: 9, fontWeight: "900", textAlign: "right", width: 74 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  action: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, minHeight: 142, overflow: "hidden", width: "48.5%" },
  actionPressable: { flex: 1, padding: 14 },
  actionIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 9, height: 36, justifyContent: "center", marginBottom: 10, width: 36 },
  actionLabel: { color: colors.text, fontSize: 14, fontWeight: "900" },
  actionCopy: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 7 },
  actionFooter: { alignItems: "center", flexDirection: "row", gap: 5, marginTop: "auto" }, arrow: { color: colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  velocity: { gap: 12 },
  velocityRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  metric: { color: colors.text, fontSize: 30, fontWeight: "900" },
  smallPrimary: { color: colors.primary, fontSize: 14 },
  progress: { backgroundColor: colors.border, borderRadius: 4, height: 6 },
  progressFill: { backgroundColor: colors.primary, borderRadius: 4, height: 6, width: "78%" },
  popupBackdrop: { backgroundColor: "rgba(0,0,0,0.68)", flex: 1, justifyContent: "flex-end", padding: 14 },
  popup: { backgroundColor: colors.raised, borderColor: colors.border, borderRadius: 12, borderTopColor: colors.primary, borderTopWidth: 3, borderWidth: 1, padding: 16 },
  popupTop: { alignItems: "center", flexDirection: "row", gap: 10 }, popupIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 10, height: 42, justifyContent: "center", width: 42 }, popupHeading: { flex: 1 }, popupEyebrow: { color: colors.primary, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 }, popupTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 4 }, close: { alignItems: "center", height: 36, justifyContent: "center", width: 36 },
  popupCopy: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 13 }, popupMatches: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, marginVertical: 14 },
  popupMatch: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 10, minHeight: 58 }, popupCourt: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 7, height: 31, justifyContent: "center", width: 31 }, popupCourtText: { color: colors.primary, fontSize: 9, fontWeight: "900" }, popupMatchCopy: { flex: 1 }, popupVenue: { color: colors.text, fontSize: 11, fontWeight: "900" }, popupTeams: { color: colors.muted, fontSize: 9, marginTop: 4 }, popupScore: { color: colors.primary, fontSize: 14, fontWeight: "900" },
  later: { alignItems: "center", marginTop: 12, padding: 7 }, laterText: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  pressed: { opacity: 0.82 },
});
