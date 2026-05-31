// pickelton-mobile/app/(tabs)/community.tsx
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { SectionHeader } from "../../components/SectionHeader";
import { apiErrorMessage, fetchCommunity, type Club } from "../../services/api";
import { colors } from "../../theme/colors";

export default function CommunityScreen() {
  const [groups, setGroups] = useState<Club[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCommunity().then(setGroups).catch((cause) => setError(apiErrorMessage(cause)));
  }, []);

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>PICKELTON</Text>
        <Text style={styles.title}>PLAYER{"\n"}<Text style={styles.primary}>FEED</Text></Text>
        <SectionHeader title="COMMUNITY GROUPS" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {groups.length ? groups.map((group) => (
          <CardContainer key={group.id} style={styles.post}>
            <Text style={styles.name}>{group.name}</Text>
            <Text style={styles.meta}>{group.location}  /  {group.memberCount ?? 0} members</Text>
            <Text style={styles.copy}>{group.description || "Ready for the next Pickelton matchday."}</Text>
          </CardContainer>
        )) : <Text style={styles.meta}>No community groups loaded yet.</Text>}
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
  post: { gap: 7, marginBottom: 10 },
  name: { color: colors.text, fontSize: 15, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  copy: { color: colors.text, fontSize: 12, lineHeight: 18 },
  error: { color: colors.danger, fontSize: 10, marginBottom: 12 },
});
