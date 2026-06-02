// pickelton-mobile/app/match/create.tsx
import { useState } from "react";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { BackLink } from "../../components/BackLink";
import { BrandMark } from "../../components/BrandMark";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { apiErrorMessage, createMatch } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function MatchCreationScreen() {
  const styles = useThemeStyles(createStyles);
  const [form, setForm] = useState({ tournamentId: "", player1Id: "", player2Id: "", round: "Round 1" });
  const [role, setRole] = useState<"scorer" | "referee" | "viewer">("scorer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const field = (name: keyof typeof form) => ({ value: form[name], onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })) });

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const match = await createMatch(form);
      router.push({ pathname: "/match/invite", params: { role, matchId: match.id } });
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
        <BackLink />
        <BrandMark compact />
        <Text style={styles.title}>CREATE MATCH</Text>
        <Text style={styles.copy}>Set up a tournament match and assign your live official.</Text>
        <CardContainer style={styles.form}>
          <InputField label="TOURNAMENT ID" placeholder="Tournament UUID" autoCapitalize="none" {...field("tournamentId")} />
          <InputField label="PLAYER A ID" placeholder="Registered player UUID" autoCapitalize="none" {...field("player1Id")} />
          <InputField label="PLAYER B ID" placeholder="Registered opponent UUID" autoCapitalize="none" {...field("player2Id")} />
          <InputField label="ROUND" placeholder="Round 1" {...field("round")} />
        </CardContainer>
        <Text style={styles.label}>ASSIGN ROLE</Text>
        <View style={styles.roles}>
          {(["scorer", "referee", "viewer"] as const).map((item) => (
            <PrimaryButton key={item} label={item.toUpperCase()} variant={role === item ? "primary" : "outline"} onPress={() => setRole(item)} style={styles.role} />
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton icon="send-outline" label={loading ? "CREATING..." : "CREATE & SEND INVITES"} onPress={submit} disabled={loading} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  title: { color: colors.text, fontSize: 32, fontStyle: "italic", fontWeight: "900", marginTop: 20 },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  form: { borderTopColor: colors.primary, borderTopWidth: 3, marginTop: 20, paddingBottom: 3 },
  label: { color: colors.primary, fontSize: 9, fontWeight: "900", marginBottom: 10, marginTop: 18 },
  roles: { flexDirection: "row", gap: 7, marginBottom: 18 },
  role: { flex: 1, minHeight: 42, paddingHorizontal: 4 },
  error: { color: colors.danger, fontSize: 10, marginBottom: 12 },
});
