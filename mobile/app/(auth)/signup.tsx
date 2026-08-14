// pickelton-mobile/app/(auth)/signup.tsx
import { useState } from "react";
import { Link, router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { StatusPill } from "../../components/StatusPill";
import { BrandMark } from "../../components/BrandMark";
import { apiErrorMessage, signup } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function SignupScreen() {
  const styles = useThemeStyles(createStyles);
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", dateOfBirth: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const field = (name: keyof typeof form) => ({ value: form[name], onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })) });

  async function submit() {
    setError("");
    setLoading(true);
    try {
      await signup({ ...form, email: form.email.trim(), phoneNumber: form.phoneNumber.replace(/\s/g, "") });
      router.replace("/(tabs)");
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
        <View style={styles.topRow}><BrandMark /><StatusPill label="NEW PLAYER" tone="gold" /></View>
        <Text style={styles.title}>JOIN THE{"\n"}ARENA</Text>
        <Text style={styles.copy}>Create your player profile once and carry it into clubs, matches, and tournaments.</Text>
        <CardContainer style={styles.card}>
          <InputField label="FULL NAME" placeholder="Alex Rivera" {...field("name")} />
          <InputField label="EMAIL ADDRESS" placeholder="alex@pickelton.app" keyboardType="email-address" autoCapitalize="none" {...field("email")} />
          <InputField label="PHONE NUMBER" placeholder="+91 98765 43210" keyboardType="phone-pad" {...field("phoneNumber")} />
          <InputField label="DATE OF BIRTH" placeholder="YYYY-MM-DD" {...field("dateOfBirth")} />
          <InputField label="CREATE PASSWORD" placeholder="Minimum 8 characters" secureTextEntry {...field("password")} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton icon="person-add-outline" label={loading ? "CREATING PROFILE..." : "SIGN UP"} onPress={submit} disabled={loading} />
        </CardContainer>
        <Text style={styles.footer}>Already have an account? <Link href="/(auth)/login" style={styles.link}>Log In</Link></Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 28 },
  topRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.text, fontSize: 36, fontStyle: "italic", fontWeight: "900", lineHeight: 36, marginTop: 36 },
  copy: { color: colors.muted, fontSize: 12, marginTop: 10 },
  card: { backgroundColor: colors.raised, borderTopColor: colors.primary, borderTopWidth: 3, marginTop: 20 },
  error: { color: colors.danger, fontSize: 10, marginBottom: 12 },
  footer: { color: colors.muted, fontSize: 12, marginTop: 22, textAlign: "center" },
  link: { color: colors.primary, fontWeight: "800" },
});
