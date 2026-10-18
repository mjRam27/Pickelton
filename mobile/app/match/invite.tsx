// pickelton-mobile/app/match/invite.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Share, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Screen } from "../../components/Screen";
import { Display } from "../../components/Typography";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

// Shown after a match is created: confirms the invitations and the viewer's role, then opens the scorer.
export default function MatchInviteScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const { role = "viewer", matchId = "" } = useLocalSearchParams<{ role?: string; matchId?: string }>();
  const authorized = role === "scorer" || role === "referee";
  const roleLabel = role === "scorer" ? "Scorekeeper" : role === "referee" ? "Referee" : "Spectator";

  return (
    <Screen
      footer={<>
        <Button iconRight="arrow-forward" label={authorized ? "Open the scorer" : "Watch live score"} onPress={() => router.replace({ pathname: "/match/scoring", params: { authorized: String(authorized), matchId } })} />
        <Button label="Back to Home" onPress={() => router.replace("/(tabs)")} size="md" variant="ghost" />
      </>}
    >
      <View style={styles.header}>
        <IconButton icon="chevron-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} />
        <View style={styles.headerCopy}>
          <Display size={32}>Invites sent</Display>
          <Text style={styles.meta}>Players accept from their invitations</Text>
        </View>
      </View>
      <View style={styles.banner}>
        <Ionicons color={colors.accInk} name="checkmark-circle" size={30} />
        <Text style={styles.bannerText}>Your match is set up. Results count toward ratings only after both sides confirm.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>You're on this match as</Text>
        <Display size={44} style={styles.role}>{roleLabel}</Display>
        <Text style={styles.label}>{authorized ? "You can record points from the scorer." : "You can follow the live score."}</Text>
      </View>
      {matchId ? (
        <View style={styles.idRow}>
          <View style={styles.flex}>
            <Text style={styles.label}>Match ID</Text>
            <Text selectable style={styles.id}>{matchId}</Text>
          </View>
          <Button icon="share-outline" label="Share" onPress={() => Share.share({ message: `Join my Pickelton match: ${matchId}` })} size="md" variant="outline" />
        </View>
      ) : null}
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => ({
  header: { alignItems: "center", flexDirection: "row", gap: 12 },
  headerCopy: { flex: 1, gap: 2 },
  meta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  banner: { alignItems: "center", backgroundColor: colors.s2, borderRadius: 16, flexDirection: "row", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  bannerText: { color: colors.text, flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  card: { backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 24, borderWidth: 1, gap: 6, padding: 20 },
  role: { color: colors.accInk },
  label: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 13 },
  idRow: { alignItems: "center", backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, padding: 12 },
  flex: { flex: 1 },
  id: { color: colors.text, fontFamily: fonts.bold, fontSize: 13, marginTop: 2 },
});
