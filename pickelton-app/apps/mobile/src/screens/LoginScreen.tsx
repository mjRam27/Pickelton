// pickelton-app/apps/mobile/src/screens/LoginScreen.tsx
import { useState } from "react";
import type { LoginRequest } from "@pickelton/api";
import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { CardContainer } from "../components/CardContainer";
import { InputField } from "../components/InputField";
import { LockKeyhole, Mail, Zap } from "../components/icons";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { colors } from "../theme/colors";
import { errorMessage } from "../utils/errorMessage";

export function LoginScreen({ onLogin, onSignup }: { onLogin: (request: LoginRequest) => Promise<void>; onSignup: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);
    try {
      await onLogin({ email: email.trim(), password });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenShell>
      <AppHeader />
      <View style={styles.hero}>
        <Text style={styles.title}>WELCOME{"\n"}<Text style={styles.lime}>BACK</Text></Text>
        <Text style={styles.copy}>Enter your tactical credentials to resume the match.</Text>
      </View>
      <CardContainer style={styles.form}>
        <Text style={styles.eyebrow}>PLAYER IDENTITY</Text>
        <InputField label="EMAIL ADDRESS" icon={Mail} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <InputField label="SECURE KEY" icon={LockKeyhole} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Text style={styles.forgot}>FORGOT PASSWORD?</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton label={loading ? "SIGNING IN..." : "SIGN IN"} Icon={Zap} onPress={submit} disabled={loading} />
        <Text style={styles.or}>OR CONNECT</Text>
        <PrimaryButton label="Continue with Google" variant="subtle" disabled />
      </CardContainer>
      <Text style={styles.footer}>
        New to the league? <Text onPress={onSignup} style={styles.link}>Create an Account</Text>
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", marginBottom: 30, marginTop: 14 },
  title: { color: colors.text, fontSize: 38, fontStyle: "italic", fontWeight: "900", lineHeight: 37, textAlign: "center" },
  lime: { color: colors.lime },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 13, maxWidth: 260, textAlign: "center" },
  form: { marginTop: 10, paddingTop: 22 },
  eyebrow: { color: colors.muted, fontSize: 9, fontWeight: "800", marginBottom: 16 },
  forgot: { alignSelf: "flex-end", color: colors.muted, fontSize: 9, fontWeight: "800", marginBottom: 18, marginTop: -8 },
  or: { color: colors.muted, fontSize: 9, fontWeight: "800", marginVertical: 22, textAlign: "center" },
  footer: { color: colors.muted, fontSize: 12, marginTop: 28, textAlign: "center" },
  link: { color: colors.lime, fontWeight: "800" },
  error: { color: colors.danger, fontSize: 10, lineHeight: 15, marginBottom: 13 },
});
