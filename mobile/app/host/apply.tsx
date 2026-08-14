// pickelton-mobile/app/host/apply.tsx
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { BackLink } from "../../components/BackLink";
import { BrandMark } from "../../components/BrandMark";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionHeader } from "../../components/SectionHeader";
import { apiErrorMessage, applyHost, uploadKycDocument } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function HostApplicationScreen() {
  const styles = useThemeStyles(createStyles);
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
        <BackLink />
        <BrandMark compact />
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
          <UploadSlot label="AADHAAR DOCUMENT" value={form.documentImageUrl} onSelect={() => pick("documentImageUrl")} />
          <UploadSlot label="SELFIE WITH DOCUMENT" value={form.selfieWithDocumentUrl} onSelect={() => pick("selfieWithDocumentUrl")} />
          <Text style={styles.uploadNote}>Photos are selected securely from your device. The private Supabase KYC bucket migration is included for deployment.</Text>
        </CardContainer>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}
        <PrimaryButton icon="shield-checkmark-outline" label="SUBMIT APPLICATION" onPress={submit} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );

  async function pick(field: "documentImageUrl" | "selfieWithDocumentUrl") {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled) {
      try {
        setMessage("Uploading private KYC image...");
        const upload = await uploadKycDocument(result.assets[0].uri);
        setForm((current) => ({ ...current, [field]: upload.url }));
        setMessage("Private KYC image uploaded.");
      } catch (cause) {
        setError(apiErrorMessage(cause));
      }
    }
  }
}

function UploadSlot({ label, value, onSelect }: { label: string; value: string; onSelect: () => void }) {
  const styles = useThemeStyles(createStyles);
  return <Pressable onPress={onSelect} style={({ pressed }) => [styles.upload, pressed && styles.pressed]}><View><Text style={styles.uploadLabel}>{label}</Text><Text style={styles.uploadState}>{value ? "READY TO UPLOAD" : "TAP TO SELECT IMAGE"}</Text></View><Text style={styles.uploadAction}>{value ? "CHANGE" : "SELECT"}</Text></Pressable>;
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  title: { color: colors.text, fontSize: 35, fontStyle: "italic", fontWeight: "900", lineHeight: 35, marginTop: 24 },
  primary: { color: colors.primary },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  card: { borderTopColor: colors.primary, borderTopWidth: 3, paddingBottom: 3 },
  error: { color: colors.danger, fontSize: 10, marginBottom: 12, marginTop: 14 },
  success: { color: colors.primary, fontSize: 10, marginBottom: 12, marginTop: 14 },
  upload: { alignItems: "center", backgroundColor: colors.background, borderColor: colors.border, borderRadius: 8, borderStyle: "dashed", borderWidth: 1, flexDirection: "row", justifyContent: "space-between", marginBottom: 12, minHeight: 68, paddingHorizontal: 14 },
  uploadLabel: { color: colors.text, fontSize: 10, fontWeight: "900" },
  uploadState: { color: colors.muted, fontSize: 9, fontWeight: "800", marginTop: 5 },
  uploadAction: { color: colors.primary, fontSize: 9, fontWeight: "900" },
  uploadNote: { color: colors.muted, fontSize: 10, lineHeight: 15, marginBottom: 14 },
  pressed: { opacity: 0.8 },
});
