import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../components/CardContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import type { ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  return <View style={styles.wrapper}><SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <View style={styles.texture}>
      {Array.from({ length: 70 }, (_, index) => <View key={index} style={styles.dot} />)}
    </View>
    <View style={styles.brand}><Ionicons color={colors.primary} name="tennisball-outline" size={68} /><Text style={styles.logo}>Pickelton</Text></View>
    <CardContainer style={styles.hero}><Text style={styles.title}>Elite Performance.</Text><Text style={styles.copy}>Experience the adrenaline of the stadium with the refinement of a VIP suite. Your gateway to elite pickleball matches and premium court culture.</Text><PrimaryButton label="GET STARTED  ->" onPress={() => router.push("/(auth)/login")} style={styles.button} /><PrimaryButton label="EXPLORE MEMBERSHIP" variant="outline" onPress={() => router.push("/(auth)/signup")} style={styles.button} /></CardContainer>
    <View style={styles.metrics}><View style={styles.metric}><Text style={styles.metricLabel}>ACTIVE PROS</Text><Text style={styles.metricValue}>1,200+</Text></View><View style={styles.metric}><Text style={styles.metricLabel}>ELITE COURTS</Text><Text style={styles.metricValue}>850</Text></View></View>
  </SafeAreaView></View>;
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 }, safe: { flex: 1, justifyContent: "space-between", overflow: "hidden", padding: 18 },
  texture: { bottom: 0, flexDirection: "row", flexWrap: "wrap", gap: 23, left: 0, opacity: 0.18, padding: 8, position: "absolute", right: 0, top: 0 },
  dot: { backgroundColor: colors.primary, borderRadius: 2, height: 2, width: 2 },
  brand: { alignItems: "center", marginTop: 50 }, logo: { color: colors.text, fontSize: 46, fontWeight: "900", marginTop: 12 },
  hero: { backgroundColor: colors.raised, borderColor: colors.border, gap: 16, padding: 24 }, title: { color: colors.text, fontSize: 27, fontWeight: "900", textAlign: "center" },
  copy: { color: colors.muted, fontSize: 15, lineHeight: 25, marginBottom: 10, textAlign: "center" }, button: { minHeight: 56 },
  metrics: { flexDirection: "row", gap: 14, marginBottom: 8 }, metric: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, flex: 1, padding: 16 },
  metricLabel: { color: colors.muted, fontSize: 10, fontWeight: "900" }, metricValue: { color: colors.text, fontSize: 24, fontWeight: "900", marginTop: 8 },
});
