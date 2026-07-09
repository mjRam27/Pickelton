import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../../components/AppHeader";
import { CardContainer } from "../../../components/CardContainer";
import { EmptyState } from "../../../components/EmptyState";
import { InputField } from "../../../components/InputField";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { apiErrorMessage, fetchRegistrationForm, submitTournamentRegistration, type RegistrationForm } from "../../../services/api";
import type { ThemeColors } from "../../../theme/colors";
import { useThemeStyles } from "../../../theme/ThemeProvider";

export default function TournamentRegisterScreen() {
  const styles = useThemeStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState<RegistrationForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchRegistrationForm(id, true)
      .then(setForm)
      .catch((cause) => setError(apiErrorMessage(cause)));
  }, [id]);

  async function submit() {
    if (!form) return;
    try {
      setSaving(true);
      setError("");
      const payload = form.fields.filter((field) => field.enabled).map((field) => ({
        fieldId: field.id!,
        value: { text: answers[field.id!] ?? "" },
      }));
      await submitTournamentRegistration(id, payload);
      router.replace({ pathname: "/tournaments/[id]", params: { id } });
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
          <AppHeader eyebrow="REGISTRATION" title="Enter tournament" />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {form ? (
            <>
              <Text style={styles.title}>PLAYER FORM</Text>
              <Text style={styles.copy}>Your submission goes to the host for approve, reject, or waitlist review.</Text>
              <CardContainer style={styles.form}>
                {form.fields.filter((field) => field.enabled).map((field) => (
                  <InputField
                    key={field.id}
                    label={`${field.label}${field.required ? " *" : ""}`}
                    placeholder={field.placeholder}
                    value={answers[field.id!] ?? ""}
                    onChangeText={(value) => setAnswers((current) => ({ ...current, [field.id!]: value }))}
                    keyboardType={field.type === "NUMBER" || field.type === "PHONE" ? "number-pad" : "default"}
                    multiline={field.type === "LONG_TEXT" || field.type === "ADDRESS"}
                  />
                ))}
              </CardContainer>
              <PrimaryButton disabled={saving} icon="send-outline" label={saving ? "Submitting" : "Submit registration"} onPress={submit} />
            </>
          ) : (
            <EmptyState title="No published form" copy="The host needs to publish the registration form before players can register." />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  title: { color: colors.text, fontSize: 34, fontWeight: "900", marginTop: 18 },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  form: { borderTopColor: colors.accent, borderTopWidth: 4, marginBottom: 14, marginTop: 20 },
  error: { color: colors.danger, fontSize: 12, fontWeight: "800", marginTop: 12 },
});
