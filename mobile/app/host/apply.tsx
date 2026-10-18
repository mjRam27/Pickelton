// pickelton-mobile/app/host/apply.tsx
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Notice } from "../../components/Notice";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { Display, SectionTitle } from "../../components/Typography";
import { apiErrorMessage, applyHost, uploadKycDocument } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

type UploadField = "documentImageUrl" | "selfieWithDocumentUrl";

export default function HostApplicationScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const [form, setForm] = useState({
    fullName: "", dateOfBirth: "", phoneNumber: "", addressLine1: "", city: "", stateRegion: "Karnataka",
    postalCode: "", idDocumentNumberLast4: "", documentImageUrl: "", selfieWithDocumentUrl: "",
  });
  const [uploading, setUploading] = useState<UploadField | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const field = (name: keyof typeof form) => ({ value: form[name], onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })) });
  const filled = [form.fullName, form.dateOfBirth, form.phoneNumber, form.addressLine1, form.city, form.postalCode].every(Boolean);
  const documented = Boolean(form.idDocumentNumberLast4 && form.documentImageUrl && form.selfieWithDocumentUrl);
  const step = filled ? (documented ? 3 : 2) : 1;

  async function submit() {
    setError("");
    if (!filled || !documented) return setError("Complete your details and upload both images before submitting.");
    setSubmitting(true);
    try {
      await applyHost({ ...form, phoneNumber: form.phoneNumber.replace(/\s/g, ""), idDocumentType: "AADHAAR", termsAccepted: true, dataProcessingConsent: true });
      router.replace("/host/status");
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  async function pick(name: UploadField) {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (result.canceled) return;
    setUploading(name);
    setError("");
    try {
      const upload = await uploadKycDocument(result.assets[0].uri);
      setForm((current) => ({ ...current, [name]: upload.url }));
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setUploading("");
    }
  }

  return (
    <Screen footer={<Button label="Submit application" loading={submitting} onPress={submit} />}>
      <View style={styles.header}>
        <IconButton icon="chevron-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/profile"))} />
        <View accessibilityLabel={`Step ${step} of 3`} style={styles.progress}>
          {[1, 2, 3].map((index) => <View key={index} style={[styles.progressBar, index <= step && styles.progressOn]} />)}
        </View>
        <Text style={styles.step}>{step}/3</Text>
      </View>

      <View style={styles.intro}>
        <Ionicons color={colors.bluInk} name="shield-checkmark" size={34} />
        <Display size={38}>Become a verified host</Display>
        <Text style={styles.copy}>Verified hosts collect entry fees in the app and get the blue badge. We check your identity before approving. It's never automatic.</Text>
      </View>

      <SectionTitle title="Your details" />
      <TextField autoComplete="name" label="Full name (as on your ID)" {...field("fullName")} />
      <View style={styles.pair}>
        <View style={styles.flex}><TextField label="Date of birth" placeholder="YYYY-MM-DD" {...field("dateOfBirth")} /></View>
        <View style={styles.flex}><TextField keyboardType="phone-pad" label="Phone" placeholder="+91" {...field("phoneNumber")} /></View>
      </View>
      <TextField label="Address" {...field("addressLine1")} />
      <View style={styles.pair}>
        <View style={styles.flex}><TextField label="City" {...field("city")} /></View>
        <View style={styles.flex}><TextField keyboardType="number-pad" label="Postal code" {...field("postalCode")} /></View>
      </View>
      <TextField label="State" {...field("stateRegion")} />

      <SectionTitle title="Identity document" />
      <TextField autoCapitalize="characters" label="Aadhaar, last 4 characters" maxLength={4} {...field("idDocumentNumberLast4")} />
      <UploadRow busy={uploading === "documentImageUrl"} done={Boolean(form.documentImageUrl)} label="AADHAAR DOCUMENT" onPress={() => pick("documentImageUrl")} />
      <UploadRow busy={uploading === "selfieWithDocumentUrl"} done={Boolean(form.selfieWithDocumentUrl)} label="SELFIE WITH DOCUMENT" onPress={() => pick("selfieWithDocumentUrl")} />
      <Text style={styles.small}>Images are uploaded to private storage and only seen by our verification team.</Text>
      <Notice message={error} />
    </Screen>
  );
}

function UploadRow({ label, done, busy, onPress }: { label: string; done: boolean; busy: boolean; onPress: () => void }) {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  return (
    <Pressable accessibilityLabel={`${label}, ${done ? "uploaded" : "not uploaded"}`} accessibilityRole="button" disabled={busy} onPress={onPress} style={[styles.upload, done && styles.uploadDone]}>
      <View style={styles.uploadIcon}>
        {busy ? <ActivityIndicator color={colors.accInk} /> : <Ionicons color={done ? colors.accInk : colors.hotInk} name={done ? "checkmark" : "image-outline"} size={20} />}
      </View>
      <View style={styles.flex}>
        <Text style={styles.uploadLabel}>{label.charAt(0) + label.slice(1).toLowerCase()}</Text>
        <Text style={styles.uploadState}>{busy ? "Uploading…" : done ? "Uploaded" : "Tap to choose a photo"}</Text>
      </View>
      <Text style={styles.uploadAction}>{done ? "Change" : "Choose"}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) => ({
  header: { alignItems: "center", flexDirection: "row", gap: 12 },
  progress: { flex: 1, flexDirection: "row", gap: 6 },
  progressBar: { backgroundColor: colors.line, borderRadius: 6, flex: 1, height: 6 },
  progressOn: { backgroundColor: colors.acc },
  step: { color: colors.muted, fontFamily: fonts.bold, fontSize: 13 },
  intro: { gap: 6 },
  copy: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  pair: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  upload: { alignItems: "center", backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 14, borderStyle: "dashed", borderWidth: 1.5, flexDirection: "row", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  uploadDone: { borderColor: colors.acc, borderStyle: "solid" },
  uploadIcon: { alignItems: "center", backgroundColor: colors.s2, borderRadius: 10, height: 40, justifyContent: "center", width: 40 },
  uploadLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  uploadState: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  uploadAction: { color: colors.accInk, fontFamily: fonts.heavy, fontSize: 13 },
  small: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },
});
