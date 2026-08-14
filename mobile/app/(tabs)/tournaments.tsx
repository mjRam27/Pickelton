import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { CardContainer } from "../../components/CardContainer";
import { EmptyState } from "../../components/EmptyState";
import { ScreenIntro } from "../../components/ScreenIntro";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusPill } from "../../components/StatusPill";
import { apiErrorMessage, fetchTournaments, type Tournament } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

const showcase: Tournament[] = [{ id: "preview-summer-smash", name: "Bengaluru Summer Smash", description: "A city-side singles ladder with a crisp Saturday finish.", sportType: "PICKLEBALL", tournamentType: "SINGLES", status: "UPCOMING", clubName: "Indiranagar Arena", entryFee: 499, maxPlayers: 32, startDate: "2026-06-20T09:00:00" }];

export default function TournamentsScreen() {
  const styles = useThemeStyles(createStyles);
  const [items, setItems] = useState<Tournament[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { fetchTournaments().then((data) => setItems(data.length ? data : showcase)).catch((cause) => { setError(apiErrorMessage(cause)); setItems(showcase); }); }, []);
  return <View style={styles.wrapper}><SafeAreaView edges={["top", "bottom"]} style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <AppHeader eyebrow="COMPETITION DESK" title="Tournament calendar" />
    <ScreenIntro title="ENTER THE" accent="BRACKET" copy="Browse upcoming events, check the field, and track the leaderboard when the rallies get serious." />
    <View style={styles.heroActions}><Pressable onPress={() => router.push("/host/status")}><Text style={styles.link}>HOST STATUS</Text></Pressable><Pressable onPress={() => router.push("/tournaments/create")}><Text style={styles.link}>CREATE EVENT</Text></Pressable></View>
    <SectionHeader title="UPCOMING EVENTS" action={`${items.length} LISTED`} />
    {error ? <Text style={styles.note}>Showing preview events while the live list reconnects.</Text> : null}
    {items.length ? items.map((item) => <Pressable key={item.id} onPress={() => router.push({ pathname: "/tournaments/[id]", params: { id: item.id } })} style={({ pressed }) => pressed && styles.pressed}><CardContainer style={styles.card}>
      <View style={styles.top}><StatusPill label={item.status} /><Text style={styles.date}>{formatDate(item.startDate)}</Text></View>
      <Text style={styles.name}>{item.name}</Text><Text style={styles.meta}>{item.clubName || "INDEPENDENT EVENT"}  /  {item.tournamentType}</Text><Text style={styles.copy}>{item.description || "Competitive Pickelton play with a clean bracket and a live leaderboard."}</Text>
      <View style={styles.bottom}><Text style={styles.fee}>RS {item.entryFee ?? 0}</Text><Text style={styles.open}>VIEW EVENT</Text></View>
    </CardContainer></Pressable>) : <EmptyState title="NO EVENTS YET" copy="The tournament calendar is clear. Approved hosts can create the first event." />}
  </ScrollView></SafeAreaView></View>;
}
function formatDate(value: string) { return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }).toUpperCase(); }
const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 }, safe: { flex: 1 }, content: { padding: 18, paddingBottom: 28 }, heroActions: { flexDirection: "row", gap: 18, marginTop: 18 }, link: { color: colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.6 },
  card: { borderTopColor: colors.primary, borderTopWidth: 3, gap: 8, marginBottom: 10 }, top: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, date: { color: colors.gold, fontSize: 10, fontWeight: "900" }, name: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 3 },
  meta: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 0.6 }, copy: { color: colors.text, fontSize: 11, lineHeight: 16 }, bottom: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 11 },
  fee: { color: colors.gold, fontSize: 13, fontWeight: "900" }, open: { color: colors.primary, fontSize: 9, fontWeight: "900" }, note: { color: colors.gold, fontSize: 10, marginBottom: 10 }, pressed: { opacity: 0.8 },
});
