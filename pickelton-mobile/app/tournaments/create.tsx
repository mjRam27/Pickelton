import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { CardContainer } from "../../components/CardContainer";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { StatusPill } from "../../components/StatusPill";
import { apiErrorMessage, createTournament, fetchCommunity, type Club } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";
export default function CreateTournamentScreen() {
  const styles = useThemeStyles(createStyles);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [form, setForm] = useState({ name: "", description: "", entryFee: "0", maxPlayers: "32", startDate: "" });
  const [type, setType] = useState<"SINGLES" | "DOUBLES">("SINGLES");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const field = (name: keyof typeof form) => ({ value: form[name], onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })) });

  useEffect(() => {
    fetchCommunity()
      .then((data) => {
        setClubs(data);
        setSelectedClubId((current) => current || data[0]?.id || "");
      })
      .catch((cause) => setError(apiErrorMessage(cause)));
  }, []);

  async function submit() {
    if (!selectedClubId) {
      setError("Create or select a club before publishing a tournament.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const event = await createTournament({
        ...form,
        clubId: selectedClubId,
        entryFee: Number(form.entryFee),
        maxPlayers: Number(form.maxPlayers),
        startDate: form.startDate,
        sportType: "PICKLEBALL",
        tournamentType: type,
      });
      setMessage("Tournament created. The bracket has a new home.");
      setTimeout(() => router.replace({ pathname: "/tournaments/[id]", params: { id: event.id } }), 500);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <AppHeader eyebrow="HOST TOOLS" title="Create tournament" />
          <Text style={styles.title}>BUILD THE{"\n"}<Text style={styles.primary}>BRACKET</Text></Text>
          <Text style={styles.copy}>Choose the club that owns the event, then set the entry, field size, and first serve time.</Text>

          <CardContainer style={styles.form}>
            <InputField label="EVENT NAME" placeholder="Bengaluru Summer Smash" {...field("name")} />
            <InputField label="DESCRIPTION" placeholder="Describe the competition" multiline {...field("description")} />
            <InputField label="ENTRY FEE" placeholder="499" keyboardType="number-pad" {...field("entryFee")} />
            <InputField label="MAX PLAYERS" placeholder="32" keyboardType="number-pad" {...field("maxPlayers")} />
            <InputField label="START DATE AND TIME" placeholder="2026-06-20T09:00:00" {...field("startDate")} />
          </CardContainer>

          <Text style={styles.label}>HOST CLUB</Text>
          <View style={styles.clubList}>
            {clubs.length ? clubs.map((club) => (
              <Pressable key={club.id} onPress={() => setSelectedClubId(club.id)} style={[styles.clubChoice, selectedClubId === club.id && styles.clubChoiceActive]}>
                <View>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <Text style={styles.clubLocation}>{club.location}</Text>
                </View>
                {selectedClubId === club.id ? <StatusPill label="SELECTED" tone="primary" /> : null}
              </Pressable>
            )) : (
              <Pressable onPress={() => router.push("/clubs/create")} style={styles.createClub}>
                <Text style={styles.createClubTitle}>No clubs available</Text>
                <Text style={styles.createClubCopy}>Create a club first, then return to publish this tournament.</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.types}>{(["SINGLES", "DOUBLES"] as const).map((item) => <PrimaryButton key={item} label={item} variant={type === item ? "primary" : "outline"} onPress={() => setType(item)} style={styles.type} />)}</View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {message ? <Text style={styles.success}>{message}</Text> : null}
          <PrimaryButton disabled={saving} icon="rocket-outline" label={saving ? "Publishing" : "Publish tournament"} onPress={submit} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  title: { color: colors.text, fontSize: 36, fontWeight: "900", lineHeight: 37, marginTop: 18 },
  primary: { color: colors.primary },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  form: { borderTopColor: colors.accent, borderTopWidth: 4, marginTop: 18, paddingBottom: 3 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.7, marginBottom: 10, marginTop: 16 },
  clubList: { gap: 10 },
  clubChoice: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", padding: 14 },
  clubChoiceActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  clubName: { color: colors.text, fontSize: 14, fontWeight: "900" },
  clubLocation: { color: colors.muted, fontSize: 11, marginTop: 3 },
  createClub: { backgroundColor: colors.primarySoft, borderColor: colors.primaryDim, borderRadius: 18, borderWidth: 1, padding: 16 },
  createClubTitle: { color: colors.text, fontSize: 14, fontWeight: "900" },
  createClubCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  types: { flexDirection: "row", gap: 8, marginBottom: 14, marginTop: 14 },
  type: { flex: 1 },
  error: { color: colors.danger, fontSize: 12, fontWeight: "700", marginBottom: 12 },
  success: { color: colors.primary, fontSize: 12, fontWeight: "800", marginBottom: 12 },
});
