import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackLink } from "../../components/BackLink";
import { BrandMark } from "../../components/BrandMark";
import { CardContainer } from "../../components/CardContainer";
import { EmptyState } from "../../components/EmptyState";
import { PlayerPicker } from "../../components/PlayerPicker";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusPill } from "../../components/StatusPill";
import { apiErrorMessage, fetchClub, fetchClubMembers, getCurrentUser, inviteClubMember, joinClub, leaveClub, updateClubMemberRole, uploadClubLogo, type Club, type ClubMember, type UserSearchResult } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function ClubDetailsScreen() {
  const styles = useThemeStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [invitee, setInvitee] = useState<UserSearchResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const user = getCurrentUser();
  const currentId = user?.userId ?? user?.id;
  const mine = members.find((member) => userId(member) === currentId);
  const isAdmin = user?.role === "ADMIN" || mine?.role === "ADMIN" || mine?.role === "OWNER";
  useEffect(() => { if (id) load(); }, [id]);
  async function load() { try { setClub(await fetchClub(id)); setMembers(await fetchClubMembers(id)); } catch (cause) { setError(apiErrorMessage(cause)); } }
  async function join() { try { await joinClub(id); setMessage("You joined the club. Welcome to the roster."); await load(); } catch (cause) { setError(apiErrorMessage(cause)); } }
  async function leave() { try { await leaveClub(id); setMessage("You left the club."); await load(); } catch (cause) { setError(apiErrorMessage(cause)); } }
  async function toggleRole(member: ClubMember) { try { await updateClubMemberRole(id, userId(member), member.role === "ADMIN" ? "MEMBER" : "ADMIN"); await load(); } catch (cause) { setError(apiErrorMessage(cause)); } }
  async function pickLogo() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return setError("Photo permission is needed to upload a club logo.");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85, allowsEditing: true, aspect: [1, 1] });
    if (result.canceled) return;
    try {
      setUploading(true);
      setClub(await uploadClubLogo(id, result.assets[0].uri));
      setMessage("Club logo uploaded.");
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setUploading(false);
    }
  }
  async function invite() {
    if (!invitee) return;
    try {
      await inviteClubMember(id, invitee.userId);
      setInvitee(null);
      setMessage(`Invite sent to ${invitee.name}.`);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  }
  if (!club) return <View style={styles.wrapper}><SafeAreaView style={styles.safe}><Text onPress={() => router.back()} style={styles.back}>BACK</Text><Text style={styles.message}>{error || "Loading club..."}</Text></SafeAreaView></View>;
  return <View style={styles.wrapper}><SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <BackLink label="BACK TO CLUBS" /><BrandMark compact />
    <View style={styles.hero}>
      {club.logoUrl ? <Image source={{ uri: club.logoUrl }} style={styles.logo} /> : <View style={styles.logoFallback}><Text style={styles.logoText}>{initials(club.name)}</Text></View>}
      <View style={styles.heroCopy}><Text style={styles.title}>{club.name.toUpperCase()}</Text><View style={styles.pills}><StatusPill label={(club.city || club.location).toUpperCase()} /><StatusPill label={`${members.length} MEMBERS`} tone="gold" /></View></View>
    </View>
    <Text style={styles.copy}>{club.description || "A local Pickelton community building better rallies and louder matchdays."}</Text>
    {message ? <Text style={styles.success}>{message}</Text> : null}{error ? <Text style={styles.error}>{error}</Text> : null}
    {isAdmin ? <PrimaryButton icon="image-outline" label={uploading ? "UPLOADING LOGO..." : "UPLOAD CLUB LOGO"} variant="outline" onPress={pickLogo} style={styles.adminButton} /> : null}
    <PrimaryButton icon={mine ? "exit-outline" : "person-add-outline"} label={mine ? "LEAVE THIS CLUB" : "JOIN THIS CLUB"} variant={mine ? "outline" : "primary"} onPress={mine ? leave : join} />
    <SectionHeader title="CLUB SNAPSHOT" /><View style={styles.metrics}><Metric value={`${members.length}`} label="PLAYERS" /><Metric value="04" label="WEEKLY GAMES" /><Metric value="A" label="ENERGY" /></View>
    {isAdmin ? <><SectionHeader title="INVITE PLAYER" /><CardContainer style={styles.inviteCard}><PlayerPicker label="PLAYER" value={invitee} onSelect={setInvitee} excludeUserIds={members.map(userId)} /><PrimaryButton icon="send-outline" label="SEND INVITE" onPress={invite} /></CardContainer></> : null}
    <SectionHeader title="CLUB MEMBERS" action={isAdmin ? "ADMIN MODE" : `${members.length} PLAYERS`} />
    {members.length ? <CardContainer style={styles.members}>{members.map((member) => <View key={member.id} style={styles.member}><View style={styles.avatar}>{member.user.avatarUrl ? <Image source={{ uri: member.user.avatarUrl }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{initials(member.user.name)}</Text>}</View><View style={styles.memberCopy}><Text style={styles.memberName}>{member.user.name}</Text><Text style={styles.memberRole}>{member.role}</Text></View>{isAdmin && userId(member) !== currentId && member.role !== "OWNER" ? <PrimaryButton label={member.role === "ADMIN" ? "DEMOTE" : "MAKE ADMIN"} variant="outline" onPress={() => toggleRole(member)} style={styles.roleButton} /> : <StatusPill label={member.role} tone={member.role === "ADMIN" || member.role === "OWNER" ? "primary" : "muted"} />}</View>)}</CardContainer> : <EmptyState title="NO MEMBERS YET" copy="Join the club to become its first matchday regular." />}
  </ScrollView></SafeAreaView></View>;
}
function Metric({ value, label }: { value: string; label: string }) { const styles = useThemeStyles(createStyles); return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
function userId(member: ClubMember) { return member.user.userId ?? member.user.id; }
function initials(name: string) { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
const createStyles = (colors: ThemeColors) => ({ wrapper: { backgroundColor: colors.background, flex: 1 }, safe: { flex: 1 }, content: { padding: 18, paddingBottom: 28 }, back: { color: colors.muted, fontSize: 10, fontWeight: "900", margin: 18 }, hero: { alignItems: "center", flexDirection: "row", gap: 14, marginTop: 18 }, heroCopy: { flex: 1 }, logo: { borderRadius: 12, height: 82, width: 82 }, logoFallback: { alignItems: "center", backgroundColor: colors.primarySoft, borderColor: colors.primary, borderRadius: 12, borderWidth: 1, height: 82, justifyContent: "center", width: 82 }, logoText: { color: colors.primary, fontSize: 20, fontWeight: "900" }, title: { color: colors.text, fontSize: 30, fontStyle: "italic", fontWeight: "900", lineHeight: 32 }, pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }, copy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 16, marginTop: 14 }, success: { color: colors.primary, fontSize: 11, marginBottom: 12 }, error: { color: colors.danger, fontSize: 11, marginBottom: 12 }, message: { color: colors.muted, margin: 18 }, adminButton: { marginBottom: 10 }, metrics: { flexDirection: "row", gap: 8 }, metric: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, flex: 1, padding: 12 }, metricValue: { color: colors.primary, fontSize: 21, fontWeight: "900" }, metricLabel: { color: colors.muted, fontSize: 8, fontWeight: "900", marginTop: 4 }, inviteCard: { borderTopColor: colors.primary, borderTopWidth: 3 }, members: { borderTopColor: colors.primary, borderTopWidth: 3, gap: 12 }, member: { alignItems: "center", flexDirection: "row", gap: 10 }, avatar: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 18, height: 36, justifyContent: "center", overflow: "hidden", width: 36 }, avatarImage: { height: 36, width: 36 }, avatarText: { color: colors.primary, fontSize: 9, fontWeight: "900" }, memberCopy: { flex: 1 }, memberName: { color: colors.text, fontSize: 12, fontWeight: "900" }, memberRole: { color: colors.muted, fontSize: 8, fontWeight: "900", marginTop: 3 }, roleButton: { minHeight: 34, paddingHorizontal: 9 } });
