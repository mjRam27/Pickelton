import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { CardContainer } from "../../components/CardContainer";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { apiErrorMessage, getCurrentUser, updateMyProfile, uploadProfileAvatar } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function EditProfileScreen() {
  const styles = useThemeStyles(createStyles);
  const user = getCurrentUser();
  const [form, setForm] = useState({ name: user?.name ?? "", phoneNumber: user?.phoneNumber ?? "", city: user?.city ?? "", bio: user?.bio ?? "" });
  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const field = (name: keyof typeof form) => ({ value: form[name], onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })) });

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo permission is required to update your avatar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.82, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  }

  async function save() {
    try {
      setSaving(true);
      setError("");
      await updateMyProfile({ name: form.name.trim(), phoneNumber: form.phoneNumber.trim(), city: form.city.trim(), bio: form.bio.trim() });
      if (avatarUri && avatarUri !== user?.avatarUrl) await uploadProfileAvatar(avatarUri);
      router.back();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <AppHeader eyebrow="PLAYER CARD" title="Edit profile" />
          <CardContainer style={styles.avatarCard}>
            {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : <View style={styles.avatarFallback}><Text style={styles.avatarFallbackText}>{form.name.slice(0, 1).toUpperCase() || "P"}</Text></View>}
            <View style={styles.avatarCopy}>
              <Text style={styles.avatarTitle}>Profile image</Text>
              <Text style={styles.avatarText}>Use a clear player photo or club-friendly avatar.</Text>
            </View>
            <PrimaryButton label="Choose" variant="outline" onPress={pickAvatar} style={styles.chooseButton} />
          </CardContainer>
          <CardContainer style={styles.formCard}>
            <InputField label="NAME" placeholder="Your name" {...field("name")} />
            <InputField label="PHONE" placeholder="+91..." keyboardType="phone-pad" {...field("phoneNumber")} />
            <InputField label="CITY" placeholder="Bengaluru" {...field("city")} />
            <InputField label="BIO" placeholder="Your playing style, availability, or favorite format." multiline {...field("bio")} />
          </CardContainer>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton disabled={saving} icon="save-outline" label={saving ? "Saving" : "Save profile"} onPress={save} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  avatarCard: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 18 },
  avatarImage: { borderRadius: 30, height: 60, width: 60 },
  avatarFallback: { alignItems: "center", backgroundColor: colors.accentSoft, borderRadius: 30, height: 60, justifyContent: "center", width: 60 },
  avatarFallbackText: { color: colors.primary, fontSize: 22, fontWeight: "900" },
  avatarCopy: { flex: 1 },
  avatarTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  avatarText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  chooseButton: { width: 92 },
  formCard: { borderTopColor: colors.accent, borderTopWidth: 4, marginBottom: 14, marginTop: 16 },
  error: { color: colors.danger, fontSize: 12, fontWeight: "800", marginBottom: 12 },
});
