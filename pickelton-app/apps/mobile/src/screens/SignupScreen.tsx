// pickelton-app/apps/mobile/src/screens/SignupScreen.tsx
import { useState } from "react";
import type { RegisterRequest } from "@pickelton/api";
import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { CardContainer } from "../components/CardContainer";
import { InputField } from "../components/InputField";
import { CalendarDays, CircleUserRound, LockKeyhole, Mail, User, Zap } from "../components/icons";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { colors } from "../theme/colors";
import { errorMessage } from "../utils/errorMessage";

export function SignupScreen({ onSignup, onLogin }: { onSignup: (request: RegisterRequest) => Promise<void>; onLogin: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setLoading(true);
    try {
      await onSignup({ name: name.trim(), email: email.trim(), phoneNumber: phoneNumber.replace(/\s/g, ""), dateOfBirth, password });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenShell>
      <AppHeader backLabel="BACK" onBack={onLogin} simple />
      <View style={styles.hero}>
        <Text style={styles.title}>JOIN THE{"\n"}ARENA</Text>
        <Text style={styles.copy}>Create your elite player profile.</Text>
      </View>
      <CardContainer style={styles.form}>
        <InputField label="FULL NAME" icon={User} placeholder="Alex Rivera" value={name} onChangeText={setName} />
        <InputField label="EMAIL ADDRESS" icon={Mail} placeholder="alex@pickelton.app" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <InputField label="PHONE NUMBER" icon={CircleUserRound} placeholder="+91 98765 43210" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
        <InputField label="DATE OF BIRTH" icon={CalendarDays} placeholder="YYYY-MM-DD" value={dateOfBirth} onChangeText={setDateOfBirth} />
        <InputField label="CREATE PASSWORD" icon={LockKeyhole} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton label={loading ? "CREATING PROFILE..." : "SIGN UP"} Icon={Zap} onPress={submit} disabled={loading} />
        <Text style={styles.or}>OR CONNECT</Text>
        <PrimaryButton label="Continue with Google" variant="subtle" disabled />
      </CardContainer>
      <Text style={styles.footer}>Already have an account? <Text onPress={onLogin} style={styles.link}>Log In</Text></Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: 20, marginTop: 8 },
  title: { color: colors.text, fontSize: 35, fontStyle: "italic", fontWeight: "900", lineHeight: 36 },
  copy: { color: colors.muted, fontSize: 12, marginTop: 11 },
  form: { marginTop: 3 },
  or: { color: colors.muted, fontSize: 9, fontWeight: "800", marginVertical: 20, textAlign: "center" },
  footer: { color: colors.muted, fontSize: 12, marginTop: 22, textAlign: "center" },
  link: { color: colors.lime, fontWeight: "800" },
  error: { color: colors.danger, fontSize: 10, lineHeight: 15, marginBottom: 13 },
});
