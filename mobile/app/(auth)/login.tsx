// pickelton-mobile/app/(auth)/login.tsx
import { useState } from "react";
import { Link, router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { StatusPill } from "../../components/StatusPill";
import { BrandMark } from "../../components/BrandMark";
import { apiErrorMessage, login } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function LoginScreen() {
  const styles = useThemeStyles(createStyles);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
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
        <View style={styles.topRow}><BrandMark /><StatusPill label="PLAYER ACCESS" /></View>
        <View style={styles.hero}>
          <Text style={styles.title}>WELCOME{"\n"}<Text style={styles.primary}>BACK</Text></Text>
          <Text style={styles.copy}>Sign in to continue your matchday, club activity, and live court access.</Text>
        </View>
        <CardContainer style={styles.card}>
          <Text style={styles.cardTitle}>ACCOUNT LOGIN</Text>
          <Text style={styles.cardCopy}>Your next rally is waiting.</Text>
          <InputField label="EMAIL ADDRESS" placeholder="Email address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <InputField label="SECURE KEY" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton icon="log-in-outline" label={loading ? "SIGNING IN..." : "SIGN IN"} onPress={submit} disabled={loading} />
        </CardContainer>
        <View style={styles.trustRow}><Text style={styles.trust}>LIVE COURTS</Text><Text style={styles.trust}>CLUB ACCESS</Text><Text style={styles.trust}>SECURE PROFILE</Text></View>
        <Text style={styles.footer}>New to the league? <Link href="/(auth)/signup" style={styles.link}>Create an Account</Link></Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 28 },
  topRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  hero: { alignItems: "center", marginBottom: 30, marginTop: 62 },
  title: { color: colors.text, fontSize: 40, fontStyle: "italic", fontWeight: "900", lineHeight: 39, textAlign: "center" },
  primary: { color: colors.primary },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 14, textAlign: "center" },
  card: { backgroundColor: colors.raised, borderTopColor: colors.primary, borderTopWidth: 3 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: "900", letterSpacing: 0.8 },
  cardCopy: { color: colors.muted, fontSize: 11, marginBottom: 18, marginTop: 6 },
  error: { color: colors.danger, fontSize: 10, marginBottom: 12 },
  footer: { color: colors.muted, fontSize: 12, marginTop: 28, textAlign: "center" },
  link: { color: colors.primary, fontWeight: "800" },
  trustRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  trust: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
});
