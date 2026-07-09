import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { CardContainer } from "../../components/CardContainer";
import { InputField } from "../../components/InputField";
import { PlayerPicker } from "../../components/PlayerPicker";
import { PrimaryButton } from "../../components/PrimaryButton";
import { apiErrorMessage, createTeam, inviteTeamMember, type UserSearchResult } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function CreateTeamUpScreen() {
  const styles = useThemeStyles(createStyles);
  const [name, setName] = useState("");
  const [invitee, setInvitee] = useState<UserSearchResult | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const team = await createTeam({ name: name.trim(), sportType: "PICKLEBALL" });
      if (invitee) await inviteTeamMember(team.id, invitee.userId);
      router.replace("/teams");
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
          <AppHeader eyebrow="TEAMUP BUILDER" title="Create squad" />
          <Text style={styles.title}>BUILD A{"\n"}<Text style={styles.accent}>TEAMUP</Text></Text>
          <Text style={styles.copy}>Start with a captain and one invite. You can expand the roster after creation.</Text>
          <CardContainer style={styles.form}>
            <InputField label="TEAM NAME" placeholder="Friday Smash Crew" value={name} onChangeText={setName} />
            <PlayerPicker label="FIRST INVITE (OPTIONAL)" value={invitee} onSelect={setInvitee} />
          </CardContainer>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton disabled={saving} icon="people-outline" label={saving ? "Creating" : "Create TeamUp"} onPress={submit} />
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
  accent: { color: colors.primary },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 10 },
  form: { borderTopColor: colors.accent, borderTopWidth: 4, marginBottom: 14, marginTop: 20 },
  error: { color: colors.danger, fontSize: 12, fontWeight: "700", marginBottom: 12 },
});
