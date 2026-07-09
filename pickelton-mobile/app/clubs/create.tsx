import { useState } from "react";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { CardContainer } from "../../components/CardContainer";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { apiErrorMessage, createClub } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function CreateClubScreen() {
  const styles = useThemeStyles(createStyles);
  const [form, setForm] = useState({ name: "", location: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })),
  });

  async function submit() {
    if (!form.name.trim() || !form.location.trim()) {
      setError("Club name and city are required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const club = await createClub({
        name: form.name.trim(),
        location: form.location.trim(),
        description: form.description.trim() || undefined,
      });
      router.replace({ pathname: "/clubs/[id]", params: { id: club.id } });
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.safe}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <AppHeader eyebrow="CLUB STUDIO" title="Create club" />
            <Text style={styles.title}>BUILD YOUR{"\n"}<Text style={styles.accent}>COURT CREW</Text></Text>
            <Text style={styles.copy}>Create a club space for members, club matches, leaderboards, and tournament hosting.</Text>

            <CardContainer style={styles.form}>
              <InputField label="CLUB NAME" placeholder="Indiranagar Pickle Crew" {...field("name")} />
              <InputField label="CITY / LOCATION" placeholder="Bengaluru" {...field("location")} />
              <InputField label="CLUB DESCRIPTION" placeholder="Who plays here, when you meet, and what level fits best." multiline {...field("description")} />
            </CardContainer>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton disabled={saving} icon="add-circle-outline" label={saving ? "Creating club" : "Create club"} onPress={submit} />
          </ScrollView>
        </KeyboardAvoidingView>
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
