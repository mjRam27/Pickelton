// pickelton-app/apps/mobile/src/screens/MatchInviteScreen.tsx
import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { CardContainer } from "../components/CardContainer";
import { MapPin, Swords } from "../components/icons";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import type { LocalMatch } from "../types/matchFlow";
import { colors } from "../theme/colors";

export function MatchInviteScreen({ match, onAccept, onDecline }: { match: LocalMatch; onAccept: () => void; onDecline: () => void }) {
  return (
    <ScreenShell>
      <AppHeader />
      <Text style={styles.brand}>PICKELTON PRECISION</Text>
      <Text style={styles.title}>MATCH{"\n"}INVITE</Text>
      <Text style={styles.subtitle}>YOU HAVE BEEN INVITED</Text>
      <CardContainer style={styles.invite}>
        <View style={styles.players}>
          <PlayerBadge name={match.players[0]} />
          <Text style={styles.vs}>VS</Text>
          <PlayerBadge name={match.players[1]} />
        </View>
        <View style={styles.detail}><Swords size={14} color={colors.blue} /><Text style={styles.detailText}>SPORT  PICKLEBALL</Text></View>
        <View style={styles.detail}><MapPin size={14} color={colors.lime} /><Text style={styles.detailText}>METRO PICKLEBALL ARENA</Text></View>
        <View style={styles.assignment}>
          <Text style={styles.assigned}>YOU ARE INVITED AS</Text>
          <Text style={styles.role}>{match.role.toUpperCase()}</Text>
        </View>
      </CardContainer>
      <PrimaryButton label="ACCEPT INVITE" onPress={onAccept} style={styles.accept} />
      <PrimaryButton label="DECLINE" variant="outline" onPress={onDecline} />
      <Text style={styles.note}>Accepting grants score access only for an assigned scorer or referee.</Text>
    </ScreenShell>
  );
}

function PlayerBadge({ name }: { name: string }) {
  return (
    <View style={styles.player}>
      <View style={styles.avatar} />
      <Text style={styles.playerName}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { color: colors.blue, fontSize: 10, fontStyle: "italic", fontWeight: "900", marginTop: 4 },
  title: { color: colors.text, fontSize: 36, fontStyle: "italic", fontWeight: "900", lineHeight: 35, marginTop: 22, textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 10, fontWeight: "800", marginBottom: 25, marginTop: 7, textAlign: "center" },
  invite: { borderColor: colors.limeDim, gap: 16, padding: 18 },
  players: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  player: { alignItems: "center", gap: 8 },
  avatar: { backgroundColor: colors.text, borderColor: colors.blue, borderRadius: 22, borderWidth: 2, height: 45, width: 45 },
  playerName: { color: colors.text, fontSize: 10, fontWeight: "800" },
  vs: { color: colors.muted, fontSize: 16, fontWeight: "900" },
  detail: { alignItems: "center", flexDirection: "row", gap: 8 },
  detailText: { color: colors.text, fontSize: 10, fontWeight: "800" },
  assignment: { alignItems: "center", backgroundColor: colors.limeDim, borderRadius: 8, padding: 18 },
  assigned: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  role: { color: colors.lime, fontSize: 29, fontStyle: "italic", fontWeight: "900", marginTop: 6 },
  accept: { marginBottom: 10, marginTop: 22 },
  note: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 20, textAlign: "center" },
});
