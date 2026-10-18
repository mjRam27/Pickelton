import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Notice } from "../../components/Notice";
import { Screen } from "../../components/Screen";
import { Segmented } from "../../components/Segmented";
import { TextField } from "../../components/TextField";
import { Display } from "../../components/Typography";
import { apiErrorMessage, createTournament } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

type Sport = "PICKLEBALL" | "BADMINTON";

export default function CreateTournamentScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const [form, setForm] = useState({ name: "", description: "", clubId: "", entryFee: "0", date: "", time: "09:00" });
  const [sport, setSport] = useState<Sport>("PICKLEBALL");
  const [type, setType] = useState<"SINGLES" | "DOUBLES">("DOUBLES");
  const [maxPlayers, setMaxPlayers] = useState(32);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const field = (name: keyof typeof form) => ({ value: form[name], onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })) });

  async function submit() {
    setError("");
    if (form.name.trim().length < 2) return setError("Give the tournament a name.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date.trim())) return setError("Enter the date as YYYY-MM-DD.");
    if (!/^\d{2}:\d{2}$/.test(form.time.trim())) return setError("Enter the start time as HH:MM.");
    const entryFee = Number(form.entryFee || 0);
    if (!Number.isFinite(entryFee) || entryFee < 0) return setError("Entry fee must be zero or more.");
    setLoading(true);
    try {
      const event = await createTournament({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        clubId: form.clubId.trim() || undefined,
        entryFee,
        maxPlayers,
        startDate: `${form.date.trim()}T${form.time.trim()}:00`,
        sportType: sport,
        tournamentType: type,
      });
      router.replace({ pathname: "/tournaments/[id]", params: { id: event.id } });
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen footer={<Button label="Publish tournament" loading={loading} onPress={submit} />}>
      <View style={styles.header}>
        <IconButton icon="close" label="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/tournaments"))} />
        <Display size={34} style={styles.title}>New tournament</Display>
      </View>
      <TextField label="Tournament name" placeholder="Bengaluru Winter Smash" {...field("name")} />
      <Segmented<Sport>
        label="Sport"
        onChange={setSport}
        options={[{ activeColor: colors.acc, label: "Pickleball", value: "PICKLEBALL" }, { activeColor: colors.blu, label: "Badminton", value: "BADMINTON" }]}
        value={sport}
      />
      <View style={styles.pair}>
        <View style={styles.flex}><TextField keyboardType="numbers-and-punctuation" label="Date" placeholder="YYYY-MM-DD" {...field("date")} /></View>
        <View style={styles.flex}><TextField keyboardType="numbers-and-punctuation" label="Start" placeholder="HH:MM" {...field("time")} /></View>
      </View>
      <View style={styles.group}>
        <Text style={styles.label}>Format</Text>
        <Segmented label="Format" onChange={setType} options={[{ label: "Singles", value: "SINGLES" }, { label: "Doubles", value: "DOUBLES" }]} value={type} />
      </View>
      <View style={styles.pair}>
        <View style={styles.box}>
          <Text style={styles.boxLabel}>Max players</Text>
          <View style={styles.stepper}>
            <Pressable accessibilityLabel="Fewer players" onPress={() => setMaxPlayers((value) => Math.max(4, value - 4))} style={styles.stepButton}><Text style={styles.stepSign}>−</Text></Pressable>
            <Text accessibilityLiveRegion="polite" style={styles.bigValue}>{maxPlayers}</Text>
            <Pressable accessibilityLabel="More players" onPress={() => setMaxPlayers((value) => Math.min(128, value + 4))} style={[styles.stepButton, styles.stepPlus]}><Text style={[styles.stepSign, styles.onAcc]}>+</Text></Pressable>
          </View>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxLabel}>Entry fee per player</Text>
          <View style={styles.fee}>
            <Text style={styles.bigValue}>₹</Text>
            <TextInput accessibilityLabel="Entry fee in rupees" keyboardType="number-pad" style={[styles.bigValue, styles.feeInput]} {...field("entryFee")} />
          </View>
        </View>
      </View>
      <TextField autoCapitalize="none" hint="Every tournament belongs to a club you own or administer." label="Club ID" placeholder="Club UUID" {...field("clubId")} />
      <TextField label="Description" multiline placeholder="Divisions, format, prizes, what to bring" {...field("description")} />
      <Notice message={error} />
      <Pressable accessibilityRole="button" onPress={() => router.push("/host/apply")} style={styles.hostBanner}>
        <Ionicons color={colors.bluInk} name="shield-checkmark" size={22} />
        <Text style={styles.hostText}><Text style={styles.hostStrong}>Collect entry fees in the app.</Text> Become a verified host to take payments and get featured.</Text>
        <Ionicons color={colors.muted} name="chevron-forward" size={18} />
      </Pressable>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => ({
  header: { alignItems: "center", flexDirection: "row", gap: 12 },
  title: { flex: 1 },
  pair: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  group: { gap: 6 },
  label: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 13 },
  box: { backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 14, borderWidth: 1.5, flex: 1, gap: 6, paddingHorizontal: 12, paddingVertical: 10 },
  boxLabel: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 12 },
  stepper: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  stepButton: { alignItems: "center", backgroundColor: colors.s2, borderRadius: 12, height: 44, justifyContent: "center", width: 44 },
  stepPlus: { backgroundColor: colors.acc },
  stepSign: { color: colors.text, fontFamily: fonts.bold, fontSize: 22 },
  onAcc: { color: colors.onAcc },
  bigValue: { color: colors.text, fontFamily: fonts.display, fontSize: 32 },
  fee: { alignItems: "center", flexDirection: "row", gap: 4, height: 44 },
  feeInput: { flex: 1, padding: 0 },
  hostBanner: { alignItems: "center", backgroundColor: colors.s2, borderRadius: 16, flexDirection: "row", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  hostText: { color: colors.text, flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  hostStrong: { fontFamily: fonts.heavy },
});
