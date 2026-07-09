import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { CardContainer } from "../../components/CardContainer";
import { EmptyState } from "../../components/EmptyState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusPill } from "../../components/StatusPill";
import { apiErrorMessage, fetchMyTeamInvitations, fetchMyTeams, respondTeamInvitation, type TeamInvitation, type TeamUp } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

export default function TeamUpsScreen() {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [teams, setTeams] = useState<TeamUp[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setError("");
      const [teamData, inviteData] = await Promise.all([fetchMyTeams(), fetchMyTeamInvitations()]);
      setTeams(teamData);
      setInvitations(inviteData);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  }

  async function respond(id: string, status: "ACCEPTED" | "DECLINED") {
    try {
      await respondTeamInvitation(id, status);
      await load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <AppHeader eyebrow="TEAMUPS" title="Squads and invites" />
          <CardContainer style={styles.hero}>
            <View style={styles.heroIcon}><Ionicons color={colors.primary} name="people-outline" size={24} /></View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Create a TeamUp</Text>
              <Text style={styles.heroText}>Invite members, track your roster, and use teams for V1 match flows.</Text>
            </View>
            <PrimaryButton label="New" onPress={() => router.push("/teams/create")} style={styles.newButton} />
          </CardContainer>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <SectionHeader title="Invitations" action={`${invitations.length}`} />
          {invitations.length ? invitations.map((invite) => (
            <CardContainer key={invite.id} style={styles.invite}>
              <View style={styles.inviteCopy}>
                <Text style={styles.teamName}>{invite.teamName}</Text>
                <Text style={styles.meta}>Invited by {invite.invitedBy.name}</Text>
              </View>
              {invite.status === "INVITED" ? (
                <View style={styles.inviteActions}>
                  <PrimaryButton label="Accept" onPress={() => respond(invite.id, "ACCEPTED")} style={styles.smallButton} />
                  <PrimaryButton label="Decline" variant="outline" onPress={() => respond(invite.id, "DECLINED")} style={styles.smallButton} />
                </View>
              ) : <StatusPill label={invite.status} />}
            </CardContainer>
          )) : <EmptyState title="No TeamUp invites" copy="Invitations from captains will appear here." />}

          <SectionHeader title="My TeamUps" action={`${teams.length}`} />
          {teams.length ? teams.map((team) => (
            <CardContainer key={team.id} style={styles.teamCard}>
              <View>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.meta}>{team.sportType} / {team.members.length} members</Text>
              </View>
              <StatusPill label={team.status} tone="primary" />
            </CardContainer>
          )) : <EmptyState title="No teams yet" copy="Create a TeamUp and invite players from search." />}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 110 },
  hero: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 18 },
  heroIcon: { alignItems: "center", backgroundColor: colors.accentSoft, borderRadius: 16, height: 52, justifyContent: "center", width: 52 },
  heroCopy: { flex: 1 },
  heroTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  heroText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  newButton: { width: 82 },
  invite: { gap: 12, marginBottom: 10 },
  inviteCopy: { gap: 3 },
  inviteActions: { flexDirection: "row", gap: 8 },
  smallButton: { flex: 1, minHeight: 42 },
  teamCard: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  teamName: { color: colors.text, fontSize: 15, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 11, fontWeight: "700", marginTop: 4 },
  error: { color: colors.danger, fontSize: 12, fontWeight: "700", marginTop: 12 },
});
