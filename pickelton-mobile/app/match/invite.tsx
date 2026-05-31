// pickelton-mobile/app/match/invite.tsx
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors } from "../../theme/colors";

export default function MatchInviteScreen() {
  const { role = "viewer", matchId = "" } = useLocalSearchParams<{ role?: string; matchId?: string }>();
  const authorized = role === "scorer" || role === "referee";

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <View style={styles.content}>
        <Text style={styles.brand}>PICKELTON PRECISION</Text>
        <Text style={styles.title}>MATCH{"\n"}INVITE</Text>
        <Text style={styles.copy}>YOU HAVE BEEN INVITED</Text>
        <CardContainer style={styles.card}>
          <View style={styles.players}>
            <Player name="PLAYER A" />
            <Text style={styles.vs}>VS</Text>
            <Player name="PLAYER B" />
          </View>
          <Text style={styles.meta}>MATCH ID  {matchId || "LOCAL DEMO"}</Text>
          <View style={styles.assignment}>
            <Text style={styles.meta}>YOU ARE INVITED AS</Text>
            <Text style={styles.role}>{role.toUpperCase()}</Text>
          </View>
        </CardContainer>
        <PrimaryButton label="ACCEPT INVITE" onPress={() => router.replace({ pathname: "/match/scoring", params: { authorized: String(authorized) } })} style={styles.accept} />
        <PrimaryButton label="DECLINE" variant="outline" onPress={() => router.replace("/(tabs)")} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function Player({ name }: { name: string }) {
  return <View style={styles.player}><View style={styles.avatar} /><Text style={styles.playerName}>{name}</Text></View>;
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 18 },
  brand: { color: colors.blue, fontSize: 10, fontStyle: "italic", fontWeight: "900" },
  title: { color: colors.text, fontSize: 38, fontStyle: "italic", fontWeight: "900", lineHeight: 37, marginTop: 27, textAlign: "center" },
  copy: { color: colors.muted, fontSize: 10, fontWeight: "900", marginBottom: 24, marginTop: 8, textAlign: "center" },
  card: { gap: 17 },
  players: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  player: { alignItems: "center", gap: 8 },
  avatar: { backgroundColor: colors.text, borderColor: colors.blue, borderRadius: 24, borderWidth: 2, height: 48, width: 48 },
  playerName: { color: colors.text, fontSize: 10, fontWeight: "900" },
  vs: { color: colors.muted, fontSize: 16, fontWeight: "900" },
  assignment: { alignItems: "center", backgroundColor: colors.primaryDim, borderRadius: 8, padding: 16 },
  role: { color: colors.primary, fontSize: 29, fontStyle: "italic", fontWeight: "900", marginTop: 5 },
  meta: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  accept: { marginBottom: 10, marginTop: 20 },
});
