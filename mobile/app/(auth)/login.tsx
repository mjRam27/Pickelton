// pickelton-mobile/app/(auth)/login.tsx
import { useState } from "react";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { Logo } from "../../components/Brand";
import { Button } from "../../components/Button";
import { Notice } from "../../components/Notice";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { Display } from "../../components/Typography";
import { apiErrorMessage, login } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function LoginScreen() {
  const styles = useThemeStyles(createStyles);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <Screen contentStyle={styles.content}>
        <View style={styles.brand}>
          <Logo size={40} />
          <Text style={styles.wordmark}>PICKELTON</Text>
        </View>
        <View style={styles.hero}>
          <Display size={52}>Welcome{"\n"}back</Display>
          <Text style={styles.copy}>Log in to see tonight's matches at your club.</Text>
        </View>
        <View style={styles.form}>
          <TextField autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="Email" onChangeText={setEmail} placeholder="you@example.com" textContentType="emailAddress" value={email} />
          <TextField autoComplete="password" label="Password" onChangeText={setPassword} onSubmitEditing={submit} placeholder="Your password" returnKeyType="go" secureTextEntry textContentType="password" value={password} />
          <Notice message={error} />
          <Button iconRight="arrow-forward" label="Log in" loading={loading} onPress={submit} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Pickelton? </Text>
          <Text accessibilityRole="link" onPress={() => router.push("/(auth)/signup")} style={styles.link}>Create an account</Text>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) => ({
  flex: { flex: 1 },
  content: { flexGrow: 1, gap: 28, paddingHorizontal: 24, paddingTop: 36 },
  brand: { alignItems: "center", flexDirection: "row", gap: 10 },
  wordmark: { color: colors.text, fontFamily: fonts.display, fontSize: 26, letterSpacing: 0.5 },
  hero: { gap: 8 },
  copy: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15 },
  form: { gap: 16 },
  footer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: "auto", paddingTop: 12 },
  footerText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15 },
  link: { color: colors.accInk, fontFamily: fonts.bold, fontSize: 15 },
});
