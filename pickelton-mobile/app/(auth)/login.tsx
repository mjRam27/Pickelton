// pickelton-mobile/app/(auth)/login.tsx
import { useState } from "react";
import { Link, router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { apiErrorMessage, login } from "../../services/api";
import { colors } from "../../theme/colors";

export default function LoginScreen() {
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
        <Text style={styles.brand}>PICKELTON</Text>
        <View style={styles.hero}>
          <Text style={styles.title}>WELCOME{"\n"}<Text style={styles.primary}>BACK</Text></Text>
          <Text style={styles.copy}>Enter your tactical credentials to resume the match.</Text>
        </View>
        <CardContainer>
          <InputField label="EMAIL ADDRESS" placeholder="Email address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <InputField label="SECURE KEY" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton label={loading ? "SIGNING IN..." : "SIGN IN"} onPress={submit} disabled={loading} />
        </CardContainer>
        <Text style={styles.footer}>New to the league? <Link href="/(auth)/signup" style={styles.link}>Create an Account</Link></Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 28 },
  brand: { color: colors.primary, fontSize: 17, fontStyle: "italic", fontWeight: "900" },
  hero: { alignItems: "center", marginBottom: 30, marginTop: 62 },
  title: { color: colors.text, fontSize: 40, fontStyle: "italic", fontWeight: "900", lineHeight: 39, textAlign: "center" },
  primary: { color: colors.primary },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 14, textAlign: "center" },
  error: { color: colors.danger, fontSize: 10, marginBottom: 12 },
  footer: { color: colors.muted, fontSize: 12, marginTop: 28, textAlign: "center" },
  link: { color: colors.primary, fontWeight: "800" },
});
