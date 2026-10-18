import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency, formatShortDate } from "@pickelton/utils";
import { router, useLocalSearchParams } from "expo-router";
import { Share, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Avatar, toneFor } from "../../components/Avatar";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyState, LoadingState } from "../../components/EmptyState";
import { IconButton } from "../../components/IconButton";
import { Notice } from "../../components/Notice";
import { Screen } from "../../components/Screen";
import { Display, SectionTitle } from "../../components/Typography";
import { apiErrorMessage, cancelTournamentRegistration, fetchTournament, fetchTournamentParticipants, getCurrentUser, registerTournament, type Tournament, type TournamentParticipant } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

export default function TournamentDetailsScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const currentId = getCurrentUser()?.userId ?? getCurrentUser()?.id;
  const registered = participants.some((person) => person.userId === currentId && person.status !== "CANCELLED");

  const load = useCallback(async () => {
    setError("");
    try {
      setItem(await fetchTournament(id));
      setParticipants(await fetchTournamentParticipants(id).catch(() => []));
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  }, [id]);

  useEffect(() => { if (id) void load(); }, [id, load]);

  async function register() {
    setBusy(true);
    setMessage("");
    try {
      await registerTournament(id);
      setMessage("You're entered. See you on court.");
      await load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    setMessage("");
    try {
      await cancelTournamentRegistration(id);
      setMessage("Registration cancelled.");
      await load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  const back = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/tournaments"));

  if (!item) {
    return (
      <Screen>
        <IconButton icon="chevron-back" label="Back to events" onPress={back} />
        {error ? <EmptyState action="Try again" copy={error} icon="cloud-offline-outline" onAction={load} title="Couldn't load this event" /> : <LoadingState label="Loading event" />}
      </Screen>
    );
  }

  const sport = item.sportType === "BADMINTON" ? "Badminton" : item.sportType === "BOTH" ? "Pickleball & badminton" : "Pickleball";
  const start = new Date(item.startDate);
  const startTime = Number.isNaN(start.getTime()) ? "" : start.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const spotsLeft = Math.max(item.maxPlayers - participants.length, 0);

  return (
    <Screen
      contentStyle={styles.content}
      footer={<>
        {registered ? <View style={styles.entered}><Ionicons color={colors.accInk} name="checkmark-circle" size={18} /><Text style={styles.enteredText}>You're entered</Text></View> : null}
        <View style={styles.footerRow}>
          <Button label="Leaderboard" onPress={() => router.push({ pathname: "/tournaments/[id]/leaderboard", params: { id } })} size="md" style={styles.flex} variant="dark" />
          <Button disabled={!registered && spotsLeft === 0} label={registered ? "Cancel entry" : spotsLeft === 0 ? "Full" : "Register"} loading={busy} onPress={registered ? cancel : register} size="md" style={styles.flex} variant={registered ? "outline" : "primary"} />
        </View>
      </>}
    >
      <View style={styles.hero}>
        <Svg height={250} style={styles.heroArt} width={390}>
          <Circle cx={195} cy={125} fill="none" opacity={0.35} r={120} stroke="#C8F03C" strokeWidth={2} />
          <Circle cx={195} cy={125} fill="none" opacity={0.25} r={80} stroke="#C8F03C" strokeWidth={2} />
          <Circle cx={195} cy={125} fill="#C8F03C" opacity={0.18} r={40} />
        </Svg>
        <View style={styles.heroBar}>
          <IconButton icon="chevron-back" label="Back to events" onPress={back} tone="overlay" />
          <IconButton icon="share-outline" label="Share event" onPress={() => Share.share({ message: `${item.name} · ${formatShortDate(item.startDate)} on Pickelton` })} tone="overlay" />
        </View>
        <View style={styles.heroCopy}>
          <Badge label={`${sport} · ${item.tournamentType === "DOUBLES" ? "Doubles" : "Singles"}`} />
          <Display size={48} style={styles.heroTitle}>{item.name}</Display>
          <Text style={styles.heroMeta}>{item.clubName ? `Hosted by ${item.clubName}` : item.createdBy?.name ? `Hosted by ${item.createdBy.name}` : "Independent event"}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <Fact label="When" value={formatShortDate(item.startDate)} detail={startTime ? `Starts ${startTime}` : undefined} />
        <Fact label="Status" value={item.status.replaceAll("_", " ").toLowerCase().replace(/^./, (c) => c.toUpperCase())} detail={item.clubName ?? undefined} />
        <Fact big label="Entry" value={item.entryFee ? formatCurrency(item.entryFee) : "Free"} detail="per player" />
        <Fact big label="Field" value={`${participants.length}/${item.maxPlayers}`} detail={spotsLeft ? `${spotsLeft} spots left` : "Waitlist only"} />
      </View>

      <Notice message={message} tone="success" />
      <Notice message={error} />

      {item.description ? <Text style={styles.description}>{item.description}</Text> : null}

      <SectionTitle title={`Players (${participants.length})`} />
      {participants.length ? participants.slice(0, 12).map((person) => (
        <View key={person.registrationId} style={styles.player}>
          <Avatar name={person.name} size={36} tone={toneFor(person.userId)} />
          <Text numberOfLines={1} style={styles.playerName}>{person.userId === currentId ? "You" : person.name}</Text>
          <Badge label={person.status} tone={person.status === "CONFIRMED" ? "accent" : "muted"} />
        </View>
      )) : <EmptyState copy="Players will appear here as registrations arrive." icon="people-outline" title="The field is open" />}
    </Screen>
  );
}

function Fact({ label, value, detail, big = false }: { label: string; value: string; detail?: string; big?: boolean }) {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={big ? styles.factBig : styles.factValue}>{value}</Text>
      {detail ? <Text numberOfLines={1} style={styles.factDetail}>{detail}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  content: { paddingTop: 0 },
  hero: { backgroundColor: "#0C100E", gap: 16, marginHorizontal: -20, overflow: "hidden", paddingBottom: 22, paddingHorizontal: 20, paddingTop: 12 },
  heroArt: { position: "absolute", right: -120, top: -20 },
  heroBar: { flexDirection: "row", justifyContent: "space-between" },
  heroCopy: { gap: 8 },
  heroTitle: { color: "#F2F5EF" },
  heroMeta: { color: "#B5C0B9", fontFamily: fonts.regular, fontSize: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 2 },
  fact: { backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flexBasis: "47%", flexGrow: 1, gap: 4, paddingHorizontal: 14, paddingVertical: 12 },
  factLabel: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 12 },
  factValue: { color: colors.text, fontFamily: fonts.heavy, fontSize: 15 },
  factBig: { color: colors.text, fontFamily: fonts.display, fontSize: 28, lineHeight: 30 },
  factDetail: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  description: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  player: { alignItems: "center", backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 12, paddingHorizontal: 12, paddingVertical: 10 },
  playerName: { color: colors.text, flex: 1, fontFamily: fonts.bold, fontSize: 14 },
  entered: { alignItems: "center", flexDirection: "row", gap: 8 },
  enteredText: { color: colors.accInk, fontFamily: fonts.bold, fontSize: 13 },
  footerRow: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
});

