import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { CardContainer } from "../../components/CardContainer";
import { EmptyState } from "../../components/EmptyState";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusPill } from "../../components/StatusPill";
import type { ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

export default function PlayScreen() {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <AppHeader eyebrow="Match desk" title="What are we playing?" />
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Start a rally, build a TeamUp, or jump into live scoring.</Text>
          </View>

          <SectionHeader title="Create" />
          <View style={styles.grid}>
            <PlayCard icon="add-circle-outline" title="Friendly match" copy="Fast setup for casual singles or doubles." onPress={() => router.push("/match/create")} />
            <PlayCard icon="trophy-outline" title="Club match" copy="Official club play for leaderboards." onPress={() => router.push("/match/create")} />
            <PlayCard icon="people-outline" title="TeamUp" copy="Create a squad and invite members." onPress={() => router.push("/teams")} />
            <PlayCard icon="radio-outline" title="Live scoring" copy="Open a scoring console." onPress={() => router.push({ pathname: "/match/scoring", params: { authorized: "false" } })} />
          </View>

          <SectionHeader title="Open invitations" action="TeamUps" />
          <EmptyState title="Open TeamUps" copy="Team invitations now live under the TeamUp hub." />

          <SectionHeader title="TeamUps" />
          <CardContainer style={styles.teamup}>
            <View style={styles.teamupIcon}><Ionicons color={colors.primary} name="people-outline" size={23} /></View>
            <View style={styles.teamupCopy}>
              <Text style={styles.teamupTitle}>TeamUps are live</Text>
              <Text style={styles.teamupText}>Create squads, invite players, and accept roster invitations.</Text>
            </View>
            <StatusPill label="V1" />
          </CardContainer>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function PlayCard({ icon, title, copy, disabled, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; copy: string; disabled?: boolean; onPress?: () => void }) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.card, disabled && styles.disabled, pressed && styles.pressed]}>
      <View style={styles.cardIcon}><Ionicons color={colors.primary} name={icon} size={22} /></View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardCopy}>{copy}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 110 },
  hero: { backgroundColor: colors.text, borderRadius: 22, marginTop: 18, padding: 20 },
  heroTitle: { color: colors.surface, fontSize: 23, fontWeight: "900", lineHeight: 29 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, minHeight: 154, padding: 15, width: "48.5%" },
  cardIcon: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 14, height: 44, justifyContent: "center", width: 44 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "800", marginTop: 13 },
  cardCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  disabled: { opacity: 0.56 },
  teamup: { alignItems: "center", flexDirection: "row", gap: 12 },
  teamupIcon: { alignItems: "center", backgroundColor: colors.accentSoft, borderRadius: 16, height: 50, justifyContent: "center", width: 50 },
  teamupCopy: { flex: 1 },
  teamupTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  teamupText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  pressed: { opacity: 0.82 },
});
