import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { CardContainer } from "../../components/CardContainer";
import { EmptyState } from "../../components/EmptyState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusPill } from "../../components/StatusPill";
import { apiErrorMessage, fetchCommunity, fetchMyClubInvitations, respondClubInvitation, type Club, type ClubInvitation } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

export default function ClubsScreen() {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [invitations, setInvitations] = useState<ClubInvitation[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const filtered = useMemo(() => clubs.filter((club) => `${club.name} ${club.location}`.toLowerCase().includes(query.toLowerCase())), [clubs, query]);

  useEffect(() => {
    fetchCommunity().then(setClubs).catch((cause) => setError(apiErrorMessage(cause)));
    fetchMyClubInvitations().then((items) => setInvitations(items.filter((item) => item.status === "INVITED"))).catch(() => undefined);
  }, []);

  async function respond(invitation: ClubInvitation, status: "ACCEPTED" | "DECLINED") {
    try {
      await respondClubInvitation(invitation.id, status);
      setInvitations((current) => current.filter((item) => item.id !== invitation.id));
      if (status === "ACCEPTED") setClubs(await fetchCommunity());
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <AppHeader eyebrow="Clubhouse" title="Find your court crowd" />

          <CardContainer style={styles.createClub}>
            <View style={styles.createIcon}><Ionicons color={colors.primary} name="trophy-outline" size={24} /></View>
            <View style={styles.createCopy}>
              <Text style={styles.createTitle}>Create up to 4 clubs</Text>
              <Text style={styles.createText}>Owners can promote admins, host club matches, and run tournaments.</Text>
            </View>
            <PrimaryButton label="Create" onPress={() => router.push("/clubs/create")} style={styles.createButton} />
          </CardContainer>

          {invitations.length ? (
            <>
              <SectionHeader title="Club invites" action={`${invitations.length} pending`} />
              {invitations.map((invitation) => (
                <CardContainer key={invitation.id} style={styles.inviteCard}>
                  <View style={styles.inviteCopy}>
                    <Text style={styles.inviteTitle}>{invitation.clubName}</Text>
                    <Text style={styles.inviteText}>Invited by {invitation.invitedBy.name}</Text>
                  </View>
                  <PrimaryButton label="Accept" onPress={() => respond(invitation, "ACCEPTED")} style={styles.inviteButton} />
                  <PrimaryButton label="Decline" variant="outline" onPress={() => respond(invitation, "DECLINED")} style={styles.inviteButton} />
                </CardContainer>
              ))}
            </>
          ) : null}

          <View style={styles.searchBox}>
            <Ionicons color={colors.muted} name="search-outline" size={18} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Search clubs or locations" placeholderTextColor={colors.subtle} style={styles.search} />
          </View>

          <SectionHeader title="Active clubs" action={`${filtered.length} found`} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {filtered.length ? filtered.map((club) => (
            <Pressable key={club.id} onPress={() => router.push({ pathname: "/clubs/[id]", params: { id: club.id } })} style={({ pressed }) => [styles.clubCard, pressed && styles.pressed]}>
              <View style={styles.clubAvatar}>{club.logoUrl ? <Image source={{ uri: club.logoUrl }} style={styles.clubLogo} /> : <Text style={styles.clubAvatarText}>{club.name.slice(0, 2).toUpperCase()}</Text>}</View>
              <View style={styles.clubCopy}>
                <View style={styles.clubTop}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <StatusPill label={`${club.memberCount ?? 0}`} />
                </View>
                <Text style={styles.clubLocation}>{club.location}</Text>
                <Text style={styles.clubDescription}>{club.description || "A local Pickelton club building its next matchday roster."}</Text>
              </View>
              <Ionicons color={colors.subtle} name="chevron-forward" size={19} />
            </Pressable>
          )) : <EmptyState title="No clubs in view" copy="Try another search or create the first club in your area." />}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 110 },
  createClub: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 18 },
  createIcon: { alignItems: "center", backgroundColor: colors.accentSoft, borderRadius: 16, height: 52, justifyContent: "center", width: 52 },
  createCopy: { flex: 1 },
  createTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  createText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  createButton: { width: 88 },
  searchBox: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 9, marginTop: 16, minHeight: 52, paddingHorizontal: 14 },
  search: { color: colors.text, flex: 1, fontSize: 14 },
  inviteCard: { alignItems: "center", borderTopColor: colors.primary, borderTopWidth: 3, flexDirection: "row", gap: 8, marginBottom: 9 },
  inviteCopy: { flex: 1 },
  inviteTitle: { color: colors.text, fontSize: 14, fontWeight: "900" },
  inviteText: { color: colors.muted, fontSize: 11, marginTop: 4 },
  inviteButton: { minHeight: 38, width: 82 },
  clubCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 13, marginBottom: 10, padding: 14 },
  clubAvatar: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 22, height: 46, justifyContent: "center", overflow: "hidden", width: 46 },
  clubLogo: { height: 46, width: 46 },
  clubAvatarText: { color: colors.primary, fontSize: 13, fontWeight: "900" },
  clubCopy: { flex: 1 },
  clubTop: { alignItems: "center", flexDirection: "row", gap: 8 },
  clubName: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "900" },
  clubLocation: { color: colors.muted, fontSize: 12, marginTop: 3 },
  clubDescription: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 6 },
  error: { color: colors.danger, fontSize: 13, marginBottom: 12 },
  pressed: { opacity: 0.82 },
});
