import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { BackLink } from "../../components/BackLink";
import { BrandMark } from "../../components/BrandMark";
import { EmptyState } from "../../components/EmptyState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusPill } from "../../components/StatusPill";
import { apiErrorMessage, cancelTournamentRegistration, fetchTournament, fetchTournamentParticipants, registerTournament, type Tournament, type TournamentParticipant } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function TournamentDetailsScreen() {
  const styles = useThemeStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [message, setMessage] = useState("");
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (id && !id.startsWith("preview-")) { fetchTournament(id).then(setItem).catch((cause) => setError(apiErrorMessage(cause))); fetchTournamentParticipants(id).then(setParticipants).catch(() => undefined); } else setItem({ id, name: "Bengaluru Summer Smash", description: "A city-side singles ladder with a crisp Saturday finish.", sportType: "PICKLEBALL", tournamentType: "SINGLES", status: "UPCOMING", clubName: "Indiranagar Arena", entryFee: 499, maxPlayers: 32, startDate: "2026-06-20T09:00:00" }); }, [id]);
  async function register() { if (id.startsWith("preview-")) return setMessage("Preview event saved. Live registration opens when the event is published."); try { await registerTournament(id); setRegistered(true); setMessage("Registration confirmed. Your paddle is officially expected."); } catch (cause) { setError(apiErrorMessage(cause)); } }
  async function cancel() { try { await cancelTournamentRegistration(id); setRegistered(false); setMessage("Registration cancelled. The bracket has been updated."); } catch (cause) { setError(apiErrorMessage(cause)); } }
  if (!item) return <View style={styles.wrapper}><SafeAreaView><Text onPress={() => router.back()} style={styles.back}>BACK</Text><Text style={styles.message}>{error || "Loading event..."}</Text></SafeAreaView></View>;
  return <View style={styles.wrapper}><SafeAreaView><ScrollView contentContainerStyle={styles.content}><BackLink label="BACK TO EVENTS" /><BrandMark compact /><Text style={styles.title}>{item.name.toUpperCase()}</Text>
    <View style={styles.pills}><StatusPill label={item.status} /><StatusPill label={item.tournamentType} tone="gold" /></View><Text style={styles.copy}>{item.description}</Text>
    <View style={styles.metrics}><Metric value={`${participants.length}/${item.maxPlayers}`} label="FIELD" /><Metric value={`RS ${item.entryFee ?? 0}`} label="ENTRY" /><Metric value={new Date(item.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }).toUpperCase()} label="START" /></View>
    {message ? <Text style={styles.success}>{message}</Text> : null}{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton icon={registered ? "close-circle-outline" : "trophy-outline"} label={registered ? "CANCEL REGISTRATION" : "REGISTER FOR EVENT"} variant={registered ? "outline" : "primary"} onPress={registered ? cancel : register} />
    <PrimaryButton label="OPEN LEADERBOARD" variant="outline" onPress={() => router.push({ pathname: "/tournaments/[id]/leaderboard", params: { id } })} style={styles.secondary} />
    <SectionHeader title="REGISTERED PLAYERS" action={`${participants.length} PLAYERS`} />
    {participants.length ? participants.slice(0, 6).map((person) => <CardContainer key={person.registrationId} style={styles.person}><Text style={styles.personName}>{person.name}</Text><StatusPill label={person.status} /></CardContainer>) : <EmptyState title="THE FIELD IS OPEN" copy="Players will appear here as registrations arrive." />}
  </ScrollView></SafeAreaView></View>;
}
function Metric({ value, label }: { value: string; label: string }) { const styles = useThemeStyles(createStyles); return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
const createStyles = (colors: ThemeColors) => ({ wrapper: { backgroundColor: colors.background, flex: 1 }, content: { padding: 18, paddingBottom: 28 }, back: { color: colors.muted, fontSize: 10, fontWeight: "900", marginBottom: 18 }, brand: { color: colors.primary, fontSize: 10, fontWeight: "900" }, title: { color: colors.text, fontSize: 31, fontStyle: "italic", fontWeight: "900", lineHeight: 33, marginTop: 18 }, pills: { flexDirection: "row", gap: 8, marginTop: 12 }, copy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 14 }, metrics: { flexDirection: "row", gap: 7, marginVertical: 18 }, metric: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderTopColor: colors.primary, borderTopWidth: 2, borderWidth: 1, flex: 1, padding: 10 }, metricValue: { color: colors.text, fontSize: 15, fontWeight: "900" }, metricLabel: { color: colors.muted, fontSize: 8, fontWeight: "900", marginTop: 5 }, secondary: { marginTop: 9 }, success: { color: colors.primary, fontSize: 11, marginBottom: 10 }, error: { color: colors.danger, fontSize: 11, marginBottom: 10 }, message: { color: colors.muted, margin: 18 }, person: { alignItems: "center", borderTopColor: colors.primary, borderTopWidth: 2, flexDirection: "row", justifyContent: "space-between", marginBottom: 8, padding: 12 }, personName: { color: colors.text, fontSize: 12, fontWeight: "900" } });
