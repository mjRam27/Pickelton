// pickelton-mobile/app/match/create.tsx
import { useState } from "react";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardContainer } from "../../components/CardContainer";
import { BackLink } from "../../components/BackLink";
import { BrandMark } from "../../components/BrandMark";
import { InputField } from "../../components/InputField";
import { PlayerPicker } from "../../components/PlayerPicker";
import { PrimaryButton } from "../../components/PrimaryButton";
import { apiErrorMessage, createMatch, type UserSearchResult } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function MatchCreationScreen() {
  const styles = useThemeStyles(createStyles);
  const [form, setForm] = useState({ tournamentId: "", round: "Round 1", location: "", refereeId: "" });
  const [teamAPlayer1, setTeamAPlayer1] = useState<UserSearchResult | null>(null);
  const [teamAPlayer2, setTeamAPlayer2] = useState<UserSearchResult | null>(null);
  const [teamBPlayer1, setTeamBPlayer1] = useState<UserSearchResult | null>(null);
  const [teamBPlayer2, setTeamBPlayer2] = useState<UserSearchResult | null>(null);
  const [scorer, setScorer] = useState<UserSearchResult | null>(null);
  const [mode, setMode] = useState<"CASUAL" | "TOURNAMENT">("CASUAL");
  const [matchType, setMatchType] = useState<"SINGLES" | "DOUBLES">("SINGLES");
  const [pointsPerSet, setPointsPerSet] = useState("21");
  const [bestOfSets, setBestOfSets] = useState("3");
  const [winByTwo, setWinByTwo] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const field = (name: keyof typeof form) => ({ value: form[name], onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })) });
  // Ids already chosen in the other player slots, so the same user can't be picked twice.
  const pickedIds = (self: UserSearchResult | null) =>
    [teamAPlayer1, teamAPlayer2, teamBPlayer1, teamBPlayer2]
      .filter((player): player is UserSearchResult => Boolean(player) && player !== self)
      .map((player) => player.userId);
  // Selected players can never be picked as the scorekeeper.
  const selectedPlayerIds = [teamAPlayer1, teamAPlayer2, teamBPlayer1, teamBPlayer2]
    .filter((player): player is UserSearchResult => Boolean(player))
    .map((player) => player.userId);

  async function submit() {
    setError("");
    const tournamentId = form.tournamentId.trim();
    const round = form.round.trim();
    const location = form.location.trim();
    const refereeId = form.refereeId.trim();
    const numericPointsPerSet = Number(pointsPerSet);
    const numericBestOfSets = Number(bestOfSets);
    if (!mode) {
      setError("Match mode is required.");
      return;
    }
    if (!matchType) {
      setError("Match type is required.");
      return;
    }
    if (!round) {
      setError("Round is required.");
      return;
    }
    if (mode === "TOURNAMENT" && !tournamentId) {
      setError("Tournament ID is required for tournament matches.");
      return;
    }
    const selectedPlayers = matchType === "SINGLES"
      ? [teamAPlayer1, teamBPlayer1]
      : [teamAPlayer1, teamAPlayer2, teamBPlayer1, teamBPlayer2];
    if (selectedPlayers.some((player) => !player)) {
      setError(matchType === "SINGLES"
        ? "Select Team A Player 1 and Team B Player 1 for singles."
        : "Select all four players for doubles.");
      return;
    }
    const chosen = selectedPlayers as UserSearchResult[];
    const uniqueIds = new Set(chosen.map((player) => player.userId));
    if (uniqueIds.size !== chosen.length) {
      setError("Each player must be a different user.");
      return;
    }
    if (scorer && uniqueIds.has(scorer.userId)) {
      setError("Scorekeeper cannot be one of the match players.");
      return;
    }
    if (!Number.isFinite(numericPointsPerSet) || numericPointsPerSet <= 0 || !Number.isFinite(numericBestOfSets) || numericBestOfSets <= 0) {
      setError("Points per set and best of sets must be positive numbers.");
      return;
    }
    setLoading(true);
    try {
      const player1Id = teamAPlayer1!.userId;
      const player2Id = teamBPlayer1!.userId;
      const participants = matchType === "SINGLES"
        ? [
          { userId: teamAPlayer1!.userId, team: "A", role: "PLAYER" },
          { userId: teamBPlayer1!.userId, team: "B", role: "PLAYER" },
        ]
        : [
          { userId: teamAPlayer1!.userId, team: "A", role: "PLAYER" },
          { userId: teamAPlayer2!.userId, team: "A", role: "PLAYER" },
          { userId: teamBPlayer1!.userId, team: "B", role: "PLAYER" },
          { userId: teamBPlayer2!.userId, team: "B", role: "PLAYER" },
        ];
      const payload = {
        mode,
        tournamentId: mode === "TOURNAMENT" ? tournamentId : null,
        player1Id,
        player2Id,
        participants,
        scorerId: scorer?.userId ?? null,
        refereeId: refereeId || null,
        sport: "PICKLEBALL",
        matchType,
        scheduledAt: null,
        location: location || null,
        rules: { pointsPerSet: numericPointsPerSet, bestOfSets: numericBestOfSets, winByTwo: Boolean(winByTwo) },
        round,
      };
      console.log("Create match payload", payload);
      const match = await createMatch(payload as any);
      const role = scorer ? "scorer" : refereeId ? "referee" : "viewer";
      router.push({ pathname: "/match/invite", params: { role, matchId: match.id } });
    } catch (cause) {
      const error = cause as any;
      console.log("Create match error data", error.response?.data);
      console.log("Create match error status", error.response?.status);
      console.log("Create match error message", error.message);
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
        <BackLink />
        <BrandMark compact />
        <Text style={styles.title}>CREATE MATCH</Text>
        <Text style={styles.copy}>Set up a tournament match and assign your live official.</Text>
        <Text style={styles.section}>MATCH SETUP</Text>
        <CardContainer style={styles.form}>
          <Text style={styles.label}>MATCH MODE</Text>
          <View style={styles.roles}>
            {(["CASUAL", "TOURNAMENT"] as const).map((item) => (
              <PrimaryButton key={item} label={item} variant={mode === item ? "primary" : "outline"} onPress={() => setMode(item)} style={styles.role} />
            ))}
          </View>
          <Text style={styles.label}>MATCH TYPE</Text>
          <View style={styles.roles}>
            {(["SINGLES", "DOUBLES"] as const).map((item) => (
              <PrimaryButton key={item} label={item} variant={matchType === item ? "primary" : "outline"} onPress={() => setMatchType(item)} style={styles.role} />
            ))}
          </View>
          {mode === "TOURNAMENT" ? <InputField label="TOURNAMENT ID" placeholder="Tournament UUID" autoCapitalize="none" {...field("tournamentId")} /> : null}
          <InputField label="ROUND" placeholder="Round 1" {...field("round")} />
          <InputField label="LOCATION" placeholder="Court or venue" {...field("location")} />
        </CardContainer>
        <Text style={styles.section}>PLAYERS</Text>
        <CardContainer style={styles.form}>
          <PlayerPicker label="TEAM A PLAYER 1" value={teamAPlayer1} onSelect={setTeamAPlayer1} excludeUserIds={pickedIds(teamAPlayer1)} />
          {matchType === "DOUBLES" ? <PlayerPicker label="TEAM A PLAYER 2" value={teamAPlayer2} onSelect={setTeamAPlayer2} excludeUserIds={pickedIds(teamAPlayer2)} /> : null}
          <PlayerPicker label="TEAM B PLAYER 1" value={teamBPlayer1} onSelect={setTeamBPlayer1} excludeUserIds={pickedIds(teamBPlayer1)} />
          {matchType === "DOUBLES" ? <PlayerPicker label="TEAM B PLAYER 2" value={teamBPlayer2} onSelect={setTeamBPlayer2} excludeUserIds={pickedIds(teamBPlayer2)} /> : null}
        </CardContainer>
        <Text style={styles.section}>RULES</Text>
        <CardContainer style={styles.form}>
          <InputField label="POINTS PER SET" placeholder="21" keyboardType="numeric" value={pointsPerSet} onChangeText={setPointsPerSet} />
          <InputField label="BEST OF SETS" placeholder="3" keyboardType="numeric" value={bestOfSets} onChangeText={setBestOfSets} />
          <Text style={styles.label}>WIN BY TWO</Text>
          <View style={styles.roles}>
            <PrimaryButton label="TRUE" variant={winByTwo ? "primary" : "outline"} onPress={() => setWinByTwo(true)} style={styles.role} />
            <PrimaryButton label="FALSE" variant={!winByTwo ? "primary" : "outline"} onPress={() => setWinByTwo(false)} style={styles.role} />
          </View>
        </CardContainer>
        <Text style={styles.section}>OFFICIALS</Text>
        <CardContainer style={styles.form}>
          <PlayerPicker label="SCOREKEEPER (OPTIONAL)" value={scorer} onSelect={setScorer} excludeUserIds={selectedPlayerIds} />
          <InputField label="REFEREE ID" placeholder="Optional referee UUID" autoCapitalize="none" {...field("refereeId")} />
        </CardContainer>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton icon="send-outline" label={loading ? "CREATING..." : "CREATE & SEND INVITES"} onPress={submit} disabled={loading} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  safe: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  title: { color: colors.text, fontSize: 32, fontStyle: "italic", fontWeight: "900", marginTop: 20 },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  form: { borderTopColor: colors.primary, borderTopWidth: 3, marginTop: 20, paddingBottom: 3 },
  section: { color: colors.primary, fontSize: 10, fontWeight: "900", marginBottom: 0, marginTop: 22 },
  label: { color: colors.primary, fontSize: 9, fontWeight: "900", marginBottom: 10, marginTop: 18 },
  roles: { flexDirection: "row", gap: 7, marginBottom: 18 },
  role: { flex: 1, minHeight: 42, paddingHorizontal: 4 },
  error: { color: colors.danger, fontSize: 10, marginBottom: 12 },
});
