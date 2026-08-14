import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackLink } from "../../components/BackLink";
import { BrandMark } from "../../components/BrandMark";
import { CardContainer } from "../../components/CardContainer";
import { EmptyState } from "../../components/EmptyState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusPill } from "../../components/StatusPill";
import { apiErrorMessage, fetchClub, fetchClubMembers, getCurrentUser, joinClub, leaveClub, updateClubMemberRole, type Club, type ClubMember } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function ClubDetailsScreen() {
  const styles = useThemeStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const currentId = getCurrentUser()?.userId ?? getCurrentUser()?.id;
  const mine = members.find((member) => member.userId === currentId);
  const isAdmin = mine?.role === "ADMIN";
  useEffect(() => { if (id) load(); }, [id]);
  async function load() { try { setClub(await fetchClub(id)); setMembers(await fetchClubMembers(id)); } catch (cause) { setError(apiErrorMessage(cause)); } }
  async function join() { try { await joinClub(id); setMessage("You joined the club. Welcome to the roster."); await load(); } catch (cause) { setError(apiErrorMessage(cause)); } }
  async function leave() { try { await leaveClub(id); setMessage("You left the club."); await load(); } catch (cause) { setError(apiErrorMessage(cause)); } }
  async function toggleRole(member: ClubMember) { try { await updateClubMemberRole(id, member.userId, member.role === "ADMIN" ? "MEMBER" : "ADMIN"); await load(); } catch (cause) { setError(apiErrorMessage(cause)); } }
  if (!club) return <View style={styles.wrapper}><SafeAreaView style={styles.safe}><Text onPress={() => router.back()} style={styles.back}>BACK</Text><Text style={styles.message}>{error || "Loading club..."}</Text></SafeAreaView></View>;
  return <View style={styles.wrapper}><SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <BackLink label="BACK TO CLUBS" /><BrandMark compact /><Text style={styles.title}>{club.name.toUpperCase()}</Text>
    <View style={styles.pills}><StatusPill label={club.location.toUpperCase()} /><StatusPill label={`${members.length} MEMBERS`} tone="gold" /></View>
    <Text style={styles.copy}>{club.description || "A local Pickelton community building better rallies and louder matchdays."}</Text>
    {message ? <Text style={styles.success}>{message}</Text> : null}{error ? <Text style={styles.error}>{error}</Text> : null}
    <PrimaryButton icon={mine ? "exit-outline" : "person-add-outline"} label={mine ? "LEAVE THIS CLUB" : "JOIN THIS CLUB"} variant={mine ? "outline" : "primary"} onPress={mine ? leave : join} />
    <SectionHeader title="CLUB SNAPSHOT" /><View style={styles.metrics}><Metric value={`${members.length}`} label="PLAYERS" /><Metric value="04" label="WEEKLY GAMES" /><Metric value="A" label="ENERGY" /></View>
    <SectionHeader title="CLUB MEMBERS" action={isAdmin ? "ADMIN MODE" : `${members.length} PLAYERS`} />
    {members.length ? <CardContainer style={styles.members}>{members.map((member) => <View key={member.id} style={styles.member}><View style={styles.avatar}><Text style={styles.avatarText}>{initials(member.name)}</Text></View><View style={styles.memberCopy}><Text style={styles.memberName}>{member.name}</Text><Text style={styles.memberRole}>{member.role}</Text></View>{isAdmin && member.userId !== currentId ? <PrimaryButton label={member.role === "ADMIN" ? "DEMOTE" : "MAKE ADMIN"} variant="outline" onPress={() => toggleRole(member)} style={styles.roleButton} /> : <StatusPill label={member.role} tone={member.role === "ADMIN" ? "primary" : "muted"} />}</View>)}</CardContainer> : <EmptyState title="NO MEMBERS YET" copy="Join the club to become its first matchday regular." />}
  </ScrollView></SafeAreaView></View>;
}
function Metric({ value, label }: { value: string; label: string }) { const styles = useThemeStyles(createStyles); return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
function initials(name: string) { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
const createStyles = (colors: ThemeColors) => ({ wrapper: { backgroundColor: colors.background, flex: 1 }, safe: { flex: 1 }, content: { padding: 18, paddingBottom: 28 }, back: { color: colors.muted, fontSize: 10, fontWeight: "900", margin: 18 }, title: { color: colors.text, fontSize: 32, fontStyle: "italic", fontWeight: "900", lineHeight: 34, marginTop: 18 }, pills: { flexDirection: "row", gap: 8, marginTop: 13 }, copy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 16, marginTop: 14 }, success: { color: colors.primary, fontSize: 11, marginBottom: 12 }, error: { color: colors.danger, fontSize: 11, marginBottom: 12 }, message: { color: colors.muted, margin: 18 }, metrics: { flexDirection: "row", gap: 8 }, metric: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, flex: 1, padding: 12 }, metricValue: { color: colors.primary, fontSize: 21, fontWeight: "900" }, metricLabel: { color: colors.muted, fontSize: 8, fontWeight: "900", marginTop: 4 }, members: { borderTopColor: colors.primary, borderTopWidth: 3, gap: 12 }, member: { alignItems: "center", flexDirection: "row", gap: 10 }, avatar: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 18, height: 36, justifyContent: "center", width: 36 }, avatarText: { color: colors.primary, fontSize: 9, fontWeight: "900" }, memberCopy: { flex: 1 }, memberName: { color: colors.text, fontSize: 12, fontWeight: "900" }, memberRole: { color: colors.muted, fontSize: 8, fontWeight: "900", marginTop: 3 }, roleButton: { minHeight: 34, paddingHorizontal: 9 } });
