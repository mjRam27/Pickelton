// pickelton-mobile/app/host/apply.tsx
import { useState } from "react";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionHeader } from "../../components/SectionHeader";
import { apiErrorMessage, applyHost } from "../../services/api";
import { colors } from "../../theme/colors";

export default function HostApplicationScreen() {
  const [form, setForm] = useState({
    fullName: "", dateOfBirth: "", phoneNumber: "", addressLine1: "", city: "", stateRegion: "Karnataka",
    postalCode: "", idDocumentNumberLast4: "", documentImageUrl: "", selfieWithDocumentUrl: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const field = (name: keyof typeof form) => ({ value: form[name], onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })) });

  async function submit() {
    setError("");
    setMessage("");
    try {
      await applyHost({ ...form, phoneNumber: form.phoneNumber.replace(/\s/g, ""), idDocumentType: "AADHAAR", termsAccepted: true, dataProcessingConsent: true });
      setMessage("Host application submitted for verification.");
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
        <Text onPress={() => router.back()} style={styles.back}>BACK</Text>
        <Text style={styles.brand}>PICKELTON</Text>
        <Text style={styles.title}>BECOME A{"\n"}<Text style={styles.primary}>HOST</Text></Text>
        <Text style={styles.copy}>Apply to host competitive tournaments after identity verification.</Text>
        <SectionHeader title="PERSONAL INFO" />
        <CardContainer style={styles.card}>
          <InputField label="FULL NAME" placeholder="Full name" {...field("fullName")} />
          <InputField label="DATE OF BIRTH" placeholder="YYYY-MM-DD" {...field("dateOfBirth")} />
          <InputField label="PHONE NUMBER" placeholder="+91 phone number" keyboardType="phone-pad" {...field("phoneNumber")} />
          <InputField label="ADDRESS" placeholder="Address line" {...field("addressLine1")} />
          <InputField label="CITY" placeholder="City" {...field("city")} />
          <InputField label="STATE" placeholder="Karnataka" {...field("stateRegion")} />
          <InputField label="POSTAL CODE" placeholder="Postal code" keyboardType="number-pad" {...field("postalCode")} />
        </CardContainer>
        <SectionHeader title="IDENTITY DOCUMENT" />
        <CardContainer style={styles.card}>
          <InputField label="AADHAAR LAST 4" placeholder="Last four characters" {...field("idDocumentNumberLast4")} />
          <InputField label="DOCUMENT IMAGE URL" placeholder="https://" autoCapitalize="none" {...field("documentImageUrl")} />
          <InputField label="SELFIE WITH DOCUMENT URL" placeholder="https://" autoCapitalize="none" {...field("selfieWithDocumentUrl")} />
        </CardContainer>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}
        <PrimaryButton label="SUBMIT APPLICATION" onPress={submit} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  back: { color: colors.muted, fontSize: 10, fontWeight: "900", marginBottom: 17 },
  brand: { color: colors.primary, fontSize: 17, fontStyle: "italic", fontWeight: "900" },
  title: { color: colors.text, fontSize: 35, fontStyle: "italic", fontWeight: "900", lineHeight: 35, marginTop: 24 },
  primary: { color: colors.primary },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  card: { paddingBottom: 3 },
  error: { color: colors.danger, fontSize: 10, marginBottom: 12, marginTop: 14 },
  success: { color: colors.primary, fontSize: 10, marginBottom: 12, marginTop: 14 },
});
