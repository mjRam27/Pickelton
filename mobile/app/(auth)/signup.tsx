// pickelton-mobile/app/(auth)/signup.tsx
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Notice } from "../../components/Notice";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { Display } from "../../components/Typography";
import { apiErrorMessage, signup, updateMyCity } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

// 0-4 strength bars: length, mixed case, digit, symbol.
function passwordStrength(value: string) {
  if (!value) return 0;
  return [value.length >= 8, /[a-z]/.test(value) && /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
}

export default function SignupScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", dateOfBirth: "", password: "", city: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const field = (name: keyof typeof form) => ({ value: form[name], onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })) });
  const strength = passwordStrength(form.password);

  async function submit() {
    setError("");
    if (!agreed) {
      setError("Please accept the Terms of Use and Privacy Policy.");
      return;
    }
    setLoading(true);
    try {
      const { city, ...account } = form;
      await signup({ ...account, email: form.email.trim(), phoneNumber: form.phoneNumber.replace(/\s/g, "") });
      // City is optional profile data; signing up must not fail because of it.
      if (city.trim()) await updateMyCity(city.trim()).catch(() => undefined);
      router.replace("/(tabs)");
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <Screen
        contentStyle={styles.content}
        footer={<>
          <Button label="Create account" loading={loading} onPress={submit} />
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already playing? </Text>
            <Text accessibilityRole="link" onPress={() => router.replace("/(auth)/login")} style={styles.link}>Log in</Text>
          </View>
        </>}
      >
        <IconButton icon="chevron-back" label="Back to log in" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(auth)/login"))} />
        <View style={styles.hero}>
          <Display size={44}>Join the rally</Display>
          <Text style={styles.copy}>Create your player profile in under a minute.</Text>
        </View>
        <TextField autoComplete="name" label="Full name" placeholder="Alex Rivera" textContentType="name" {...field("name")} />
        <TextField autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="Email" placeholder="you@example.com" textContentType="emailAddress" {...field("email")} />
        <TextField autoComplete="tel" keyboardType="phone-pad" label="Phone number" placeholder="+91 98765 43210" textContentType="telephoneNumber" {...field("phoneNumber")} />
        <TextField hint="Format YYYY-MM-DD" label="Date of birth" placeholder="1995-04-21" {...field("dateOfBirth")} />
        <View style={styles.passwordGroup}>
          <TextField autoComplete="new-password" label="Password" placeholder="At least 8 characters" secureTextEntry textContentType="newPassword" {...field("password")} />
          <View accessibilityLabel={`Password strength ${strength} of 4`} style={styles.meter}>
            {[0, 1, 2, 3].map((index) => <View key={index} style={[styles.meterBar, index < strength && { backgroundColor: strength >= 3 ? colors.acc : colors.hot }]} />)}
          </View>
          {form.password ? <Text style={styles.hint}>{strength >= 3 ? "Strong password" : "Add length, a number or a symbol"}</Text> : null}
        </View>
        <TextField label="Home city (optional)" placeholder="Bengaluru" textContentType="addressCity" {...field("city")} />
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => setAgreed((value) => !value)} style={styles.consent}>
          <View style={[styles.checkbox, agreed && styles.checkboxOn]}>{agreed ? <Ionicons color={colors.onAcc} name="checkmark" size={16} /> : null}</View>
          <Text style={styles.consentText}>I agree to the Terms of Use and Privacy Policy.</Text>
        </Pressable>
        <Notice message={error} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) => ({
  flex: { flex: 1 },
  content: { gap: 14, paddingHorizontal: 24 },
  hero: { gap: 6, marginBottom: 6, marginTop: 6 },
  copy: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15 },
  passwordGroup: { gap: 6 },
  meter: { flexDirection: "row", gap: 4, paddingTop: 2 },
  meterBar: { backgroundColor: colors.line, borderRadius: 4, flex: 1, height: 4 },
  hint: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  consent: { alignItems: "flex-start", flexDirection: "row", gap: 10, paddingVertical: 4 },
  checkbox: { alignItems: "center", borderColor: colors.line, borderRadius: 6, borderWidth: 1.5, height: 22, justifyContent: "center", width: 22 },
  checkboxOn: { backgroundColor: colors.acc, borderColor: colors.acc },
  consentText: { color: colors.muted, flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  footerRow: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14 },
  link: { color: colors.accInk, fontFamily: fonts.bold, fontSize: 14 },
});
