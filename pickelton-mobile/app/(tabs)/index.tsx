// pickelton-mobile/app/(tabs)/index.tsx
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SectionHeader } from "../../components/SectionHeader";
import { colors } from "../../theme/colors";

export default function HomeScreen() {
  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>PICKELTON</Text>
        <CardContainer style={styles.hero}>
          <Text style={styles.kicker}>LIVE SPORTS NETWORK</Text>
          <Text style={styles.title}>OWN THE{"\n"}<Text style={styles.primary}>COURT.</Text></Text>
          <Text style={styles.copy}>Create matches, rally your club and host competitive tournaments.</Text>
          <PrimaryButton label="CREATE MATCH" onPress={() => router.push("/match/create")} />
        </CardContainer>
        <SectionHeader title="QUICK ACTIONS" />
        <View style={styles.grid}>
          <Action label="LIVE SCORING" onPress={() => router.push({ pathname: "/match/scoring", params: { authorized: "false" } })} />
          <Action label="CLUBS" onPress={() => router.push("/(tabs)/clubs")} />
          <Action label="COMMUNITY" onPress={() => router.push("/(tabs)/community")} />
          <Action label="BECOME A HOST" onPress={() => router.push("/host/apply")} />
        </View>
        <SectionHeader title="YOUR VELOCITY" />
        <CardContainer>
          <Text style={styles.metric}>1,240 <Text style={styles.smallPrimary}>XP</Text></Text>
          <Text style={styles.copy}>Top 5% of players in Bengaluru</Text>
          <View style={styles.progress}><View style={styles.progressFill} /></View>
        </CardContainer>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return <PrimaryButton label={label} onPress={onPress} variant="subtle" style={styles.action} />;
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  brand: { color: colors.primary, fontSize: 17, fontStyle: "italic", fontWeight: "900", marginBottom: 14 },
  hero: { gap: 12, paddingVertical: 22 },
  kicker: { color: colors.primary, fontSize: 9, fontWeight: "900" },
  title: { color: colors.text, fontSize: 38, fontStyle: "italic", fontWeight: "900", lineHeight: 37 },
  primary: { color: colors.primary },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  action: { minHeight: 72, width: "48.5%" },
  metric: { color: colors.text, fontSize: 34, fontWeight: "900" },
  smallPrimary: { color: colors.primary, fontSize: 15 },
  progress: { backgroundColor: colors.border, borderRadius: 3, height: 5, marginTop: 13 },
  progressFill: { backgroundColor: colors.primary, height: 5, width: "78%" },
});
