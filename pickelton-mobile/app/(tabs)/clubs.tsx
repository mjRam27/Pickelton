// pickelton-mobile/app/(tabs)/clubs.tsx
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { InputField } from "../../components/InputField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionHeader } from "../../components/SectionHeader";
import { apiErrorMessage, createClub, fetchCommunity, type Club } from "../../services/api";
import { colors } from "../../theme/colors";

export default function ClubsScreen() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [form, setForm] = useState({ name: "", location: "", description: "" });
  const [error, setError] = useState("");
  const field = (name: keyof typeof form) => ({ value: form[name], onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })) });

  useEffect(() => {
    fetchCommunity().then(setClubs).catch((cause) => setError(apiErrorMessage(cause)));
  }, []);

  async function submit() {
    setError("");
    try {
      const club = await createClub(form);
      setClubs((current) => [club, ...current]);
      setForm({ name: "", location: "", description: "" });
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>PICKELTON</Text>
        <Text style={styles.title}>CLUBS &{"\n"}<Text style={styles.primary}>GROUPS</Text></Text>
        <CardContainer style={styles.form}>
          <InputField label="CLUB NAME" placeholder="Westside Smashers" {...field("name")} />
          <InputField label="LOCATION" placeholder="Bengaluru" {...field("location")} />
          <InputField label="DESCRIPTION" placeholder="Describe your club" {...field("description")} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton label="CREATE CLUB" onPress={submit} />
        </CardContainer>
        <SectionHeader title="ACTIVE CLUBS" />
        {clubs.length ? clubs.map((club) => (
          <CardContainer key={club.id} style={styles.club}>
            <Text style={styles.clubName}>{club.name}</Text>
            <Text style={styles.meta}>{club.location}  /  {club.memberCount ?? 0} members</Text>
            <Text style={styles.copy}>{club.description || "New Pickelton community club."}</Text>
          </CardContainer>
        )) : <Text style={styles.meta}>No clubs loaded yet.</Text>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  brand: { color: colors.primary, fontSize: 17, fontStyle: "italic", fontWeight: "900" },
  title: { color: colors.text, fontSize: 34, fontStyle: "italic", fontWeight: "900", lineHeight: 34, marginTop: 24 },
  primary: { color: colors.primary },
  form: { marginTop: 18, paddingBottom: 4 },
  club: { gap: 7, marginBottom: 10 },
  clubName: { color: colors.text, fontSize: 15, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  copy: { color: colors.text, fontSize: 11, lineHeight: 16 },
  error: { color: colors.danger, fontSize: 10, marginBottom: 12 },
});
