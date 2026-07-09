import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { CardContainer } from "../../components/CardContainer";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusPill } from "../../components/StatusPill";
import { getCurrentUser } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

const liveMatches = [
  { label: "FRIENDLY", venue: "Greenpoint Pickle", time: "Today · 7:30 PM", teams: "AM / RK vs SJ / TP", score: "8 - 6" },
  { label: "CLUB", venue: "Indiranagar Arena", time: "Live now", teams: "Falcons vs Smashers", score: "10 - 9" },
];

const suggestedClubs = [
  { name: "Net Masters", location: "Indiranagar", members: 42 },
  { name: "Whitefield Pickle Hub", location: "Whitefield", members: 68 },
];

export default function HomeScreen() {
  const firstName = getCurrentUser()?.name.split(" ")[0] ?? "Player";
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <AppHeader eyebrow="Tuesday evening" title={`Hey ${firstName}`} />

          <View style={styles.quickGrid}>
            <QuickAction icon="add-circle-outline" label="Create match" dark onPress={() => router.push("/match/create")} />
            <QuickAction icon="calendar-outline" label="Book a court" onPress={() => router.push("/(tabs)/community")} />
            <QuickAction icon="people-outline" label="Join match" onPress={() => router.push("/match/invite")} />
          </View>

          <SectionHeader title="Upcoming match" action="See all" />
          <CardContainer style={styles.featuredMatch}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchType}>FRIENDLY · DOUBLES</Text>
              <Text style={styles.matchTime}>Today · 7:30 PM</Text>
            </View>
            <View style={styles.versusRow}>
              <AvatarStack names={["AM", "RK"]} />
              <Text style={styles.vs}>vs</Text>
              <AvatarStack names={["SJ", "TP"]} />
              <View style={styles.venueBlock}>
                <Text style={styles.venueName}>Greenpoint Padel & Pickle</Text>
                <Text style={styles.venueMeta}>Court 3 · 2.1 km</Text>
              </View>
            </View>
            <View style={styles.matchActions}>
              <Pressable style={styles.primaryCta} onPress={() => router.push({ pathname: "/match/scoring", params: { authorized: "false" } })}>
                <Ionicons color={colors.surface} name="radio-outline" size={16} />
                <Text style={styles.primaryCtaText}>Live scoring</Text>
              </Pressable>
              <Pressable style={styles.secondaryCta} onPress={() => router.push("/match/create")}>
                <Text style={styles.secondaryCtaText}>Create another</Text>
              </Pressable>
            </View>
          </CardContainer>

          <SectionHeader title="Live scores" action="View all" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.liveList}>
            {liveMatches.map((match) => (
              <Pressable key={`${match.venue}-${match.score}`} onPress={() => router.push({ pathname: "/match/scoring", params: { authorized: "false" } })} style={({ pressed }) => [styles.liveCard, pressed && styles.pressed]}>
                <View style={styles.liveTop}>
                  <StatusPill label={match.label} tone={match.label === "CLUB" ? "gold" : "primary"} />
                  <Text style={styles.liveTime}>{match.time}</Text>
                </View>
                <Text style={styles.liveVenue}>{match.venue}</Text>
                <Text style={styles.liveTeams}>{match.teams}</Text>
                <Text style={styles.liveScore}>{match.score}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <SectionHeader title="Suggested clubs" action="Browse" />
          <View style={styles.clubList}>
            {suggestedClubs.map((club) => (
              <Pressable key={club.name} onPress={() => router.push("/(tabs)/clubs")} style={({ pressed }) => [styles.clubCard, pressed && styles.pressed]}>
                <View style={styles.clubIcon}><Ionicons color={colors.primary} name="trophy-outline" size={20} /></View>
                <View style={styles.clubCopy}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <Text style={styles.clubMeta}>{club.location} · {club.members} members</Text>
                </View>
                <Ionicons color={colors.subtle} name="chevron-forward" size={19} />
              </Pressable>
            ))}
          </View>

          <SectionHeader title="Player pulse" />
          <View style={styles.statsGrid}>
            <Metric value="12" label="Matches" />
            <Metric value="8" label="Wins" />
            <Metric value="3.4" label="Rating" />
          </View>

          <SectionHeader title="Next up" />
          <CardContainer style={styles.nextCard}>
            <View style={styles.nextIcon}><Ionicons color={colors.primary} name="sparkles-outline" size={22} /></View>
            <View style={styles.nextCopy}>
              <Text style={styles.nextTitle}>TeamUps are coming into V1</Text>
              <Text style={styles.nextText}>Create a squad, invite players, and start tracking team matches.</Text>
            </View>
          </CardContainer>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function QuickAction({ icon, label, dark, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; dark?: boolean; onPress: () => void }) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, dark && styles.quickActionDark, pressed && styles.pressed]}>
      <Ionicons color={dark ? colors.accent : colors.primary} name={icon} size={23} />
      <Text style={[styles.quickLabel, dark && styles.quickLabelDark]}>{label}</Text>
    </Pressable>
  );
}

function AvatarStack({ names }: { names: string[] }) {
  const styles = useThemeStyles(createStyles);
  return <View style={styles.avatarStack}>{names.map((name, index) => <View key={name} style={[styles.playerAvatar, index > 0 && styles.avatarOverlap]}><Text style={styles.playerInitials}>{name}</Text></View>)}</View>;
}

function Metric({ value, label }: { value: string; label: string }) {
  const styles = useThemeStyles(createStyles);
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 110 },
  quickGrid: { flexDirection: "row", gap: 8, marginTop: 18 },
  quickAction: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, flex: 1, gap: 8, minHeight: 92, padding: 13 },
  quickActionDark: { backgroundColor: colors.text, borderColor: colors.text },
  quickLabel: { color: colors.text, fontSize: 12, fontWeight: "800", lineHeight: 16 },
  quickLabelDark: { color: colors.surface },
  featuredMatch: { backgroundColor: colors.primary, borderColor: colors.primary, borderRadius: 20, padding: 18 },
  matchHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  matchType: { color: colors.accent, fontSize: 11, fontWeight: "800" },
  matchTime: { backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 12, color: colors.surface, fontSize: 12, fontWeight: "700", overflow: "hidden", paddingHorizontal: 10, paddingVertical: 4 },
  versusRow: { alignItems: "center", flexDirection: "row", gap: 11, marginTop: 18 },
  avatarStack: { flexDirection: "row" },
  playerAvatar: { alignItems: "center", backgroundColor: "#DDE7DF", borderColor: colors.primary, borderRadius: 20, borderWidth: 2, height: 40, justifyContent: "center", width: 40 },
  avatarOverlap: { marginLeft: -10 },
  playerInitials: { color: colors.primary, fontSize: 12, fontWeight: "900" },
  vs: { color: colors.accent, fontSize: 15, fontWeight: "900" },
  venueBlock: { flex: 1 },
  venueName: { color: colors.surface, fontSize: 13, fontWeight: "800", textAlign: "right" },
  venueMeta: { color: colors.primaryDim, fontSize: 12, marginTop: 3, textAlign: "right" },
  matchActions: { flexDirection: "row", gap: 9, marginTop: 18 },
  primaryCta: { alignItems: "center", backgroundColor: colors.text, borderRadius: 21, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 42, paddingHorizontal: 15 },
  primaryCtaText: { color: colors.surface, fontSize: 13, fontWeight: "800" },
  secondaryCta: { alignItems: "center", borderColor: "rgba(255,255,255,0.25)", borderRadius: 21, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 42 },
  secondaryCtaText: { color: colors.surface, fontSize: 13, fontWeight: "700" },
  liveList: { gap: 10, paddingBottom: 2 },
  liveCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, padding: 14, width: 230 },
  liveTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  liveTime: { color: colors.muted, fontSize: 11 },
  liveVenue: { color: colors.text, fontSize: 15, fontWeight: "800", marginTop: 14 },
  liveTeams: { color: colors.muted, fontSize: 12, marginTop: 5 },
  liveScore: { color: colors.primary, fontSize: 28, fontWeight: "900", marginTop: 12 },
  clubList: { gap: 8 },
  clubCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, padding: 13 },
  clubIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  clubCopy: { flex: 1 },
  clubName: { color: colors.text, fontSize: 14, fontWeight: "800" },
  clubMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  statsGrid: { flexDirection: "row", gap: 9 },
  metric: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flex: 1, padding: 14 },
  metricValue: { color: colors.primary, fontSize: 25, fontWeight: "900" },
  metricLabel: { color: colors.muted, fontSize: 12, fontWeight: "700", marginTop: 3 },
  nextCard: { alignItems: "center", flexDirection: "row", gap: 13 },
  nextIcon: { alignItems: "center", backgroundColor: colors.accentSoft, borderRadius: 15, height: 48, justifyContent: "center", width: 48 },
  nextCopy: { flex: 1 },
  nextTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  nextText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  pressed: { opacity: 0.82 },
});
