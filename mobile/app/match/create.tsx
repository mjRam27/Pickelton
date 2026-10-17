// pickelton-mobile/app/match/create.tsx
import { useEffect, useState } from "react";
import { rulesets } from "@pickelton/constants";
import { router } from "expo-router";
import { Pressable, Switch, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { Notice } from "../../components/Notice";
import { PlayerPicker } from "../../components/PlayerPicker";
import { Screen } from "../../components/Screen";
import { Segmented } from "../../components/Segmented";
import { TextField } from "../../components/TextField";
import { Display } from "../../components/Typography";
import { apiErrorMessage, createMatch, fetchHostedTournaments, type Tournament, type UserSearchResult } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

type Sport = keyof typeof rulesets;

export default function MatchCreationScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const [sport, setSport] = useState<Sport>("PICKLEBALL");
  const [mode, setMode] = useState<"CASUAL" | "TOURNAMENT">("CASUAL");
  const [matchType, setMatchType] = useState<"SINGLES" | "DOUBLES">("DOUBLES");
  const [pointsPerSet, setPointsPerSet] = useState(rulesets.PICKLEBALL.pointsToWin);
  const [bestOfSets, setBestOfSets] = useState(3);
  const [winByTwo, setWinByTwo] = useState(true);
  const [form, setForm] = useState({ round: "Round 1", location: "" });
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [teamAPlayer1, setTeamAPlayer1] = useState<UserSearchResult | null>(null);
  const [teamAPlayer2, setTeamAPlayer2] = useState<UserSearchResult | null>(null);
  const [teamBPlayer1, setTeamBPlayer1] = useState<UserSearchResult | null>(null);
  const [teamBPlayer2, setTeamBPlayer2] = useState<UserSearchResult | null>(null);
  const [scorer, setScorer] = useState<UserSearchResult | null>(null);
  const [referee, setReferee] = useState<UserSearchResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const ruleset = rulesets[sport];

  useEffect(() => { fetchHostedTournaments().then(setTournaments).catch(() => setTournaments([])); }, []);
  const field = (name: keyof typeof form) => ({ value: form[name], onChangeText: (value: string) => setForm((current) => ({ ...current, [name]: value })) });

  function chooseSport(next: Sport) {
    setSport(next);
    setPointsPerSet(rulesets[next].pointsToWin);
  }

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
    const round = form.round.trim();
    if (!round) return setError("Round is required.");
    if (mode === "TOURNAMENT" && !selectedTournament) return setError("Select one of your hosted tournaments.");
    const selectedPlayers = matchType === "SINGLES" ? [teamAPlayer1, teamBPlayer1] : [teamAPlayer1, teamAPlayer2, teamBPlayer1, teamBPlayer2];
    if (selectedPlayers.some((player) => !player)) {
      return setError(matchType === "SINGLES" ? "Pick one player for each side." : "Pick all four players for doubles.");
    }
    const chosen = selectedPlayers as UserSearchResult[];
    const uniqueIds = new Set(chosen.map((player) => player.userId));
    if (uniqueIds.size !== chosen.length) return setError("Each player must be a different user.");
    if (scorer && uniqueIds.has(scorer.userId)) return setError("Scorekeeper cannot be one of the match players.");
    setLoading(true);
    try {
      const participants = matchType === "SINGLES"
        ? [{ userId: teamAPlayer1!.userId, team: "A", role: "PLAYER" }, { userId: teamBPlayer1!.userId, team: "B", role: "PLAYER" }]
        : [
          { userId: teamAPlayer1!.userId, team: "A", role: "PLAYER" },
          { userId: teamAPlayer2!.userId, team: "A", role: "PLAYER" },
          { userId: teamBPlayer1!.userId, team: "B", role: "PLAYER" },
          { userId: teamBPlayer2!.userId, team: "B", role: "PLAYER" },
        ];
      const match = await createMatch({
        mode,
        tournamentId: mode === "TOURNAMENT" ? selectedTournament?.id : null,
        player1Id: teamAPlayer1!.userId,
        player2Id: teamBPlayer1!.userId,
        participants,
        scorerId: scorer?.userId ?? null,
        refereeId: referee?.userId ?? null,
        sport,
        matchType,
        scheduledAt: null,
        location: form.location.trim() || null,
        rules: { pointsPerSet, bestOfSets, winByTwo },
        round,
      });
      const role = scorer ? "scorer" : referee ? "referee" : "viewer";
      router.push({ pathname: "/match/invite", params: { role, matchId: match.id } });
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen footer={<Button iconRight="arrow-forward" label="Create & send invites" loading={loading} onPress={submit} />}>
      <View style={styles.header}>
        <IconButton icon="close" label="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} />
        <Display size={36}>New match</Display>
      </View>

      <Group label="Sport">
        <View style={styles.row}>
          {(["PICKLEBALL", "BADMINTON"] as const).map((item) => {
            const active = sport === item;
            const fill = item === "PICKLEBALL" ? colors.acc : colors.blu;
            return (
              <Pressable accessibilityRole="radio" accessibilityState={{ selected: active }} key={item} onPress={() => chooseSport(item)} style={[styles.sport, active && { backgroundColor: fill, borderColor: fill }]}>
                <Text style={[styles.sportName, active && styles.onAcc]}>{item === "PICKLEBALL" ? "PICKLEBALL" : "BADMINTON"}</Text>
                <Text style={[styles.sportSub, active && styles.onAcc]}>{item === "PICKLEBALL" ? "Paddle · plastic ball" : "Racket · shuttlecock"}</Text>
              </Pressable>
            );
          })}
        </View>
      </Group>

      <Group label="Match type">
        <Segmented label="Match type" onChange={setMode} options={[{ label: "Friendly", value: "CASUAL" }, { label: "Tournament", value: "TOURNAMENT" }]} value={mode} />
        {mode === "TOURNAMENT" ? (tournaments.length ? tournaments.map((item) => (
          <Pressable accessibilityRole="radio" accessibilityState={{ selected: selectedTournament?.id === item.id }} key={item.id} onPress={() => setSelectedTournament(item)} style={[styles.option, selectedTournament?.id === item.id && styles.optionActive]}>
            <Text style={styles.optionTitle}>{item.name}</Text>
            <Text style={styles.optionMeta}>{[item.clubName, item.status.toLowerCase()].filter(Boolean).join(" · ")}</Text>
          </Pressable>
        )) : <Text style={styles.muted}>You aren't hosting any tournaments yet.</Text>) : null}
      </Group>

      <Group label="Format">
        <Segmented label="Format" onChange={setMatchType} options={[{ label: "Singles", value: "SINGLES" }, { label: "Doubles", value: "DOUBLES" }]} value={matchType} />
      </Group>

      <Group label="Scoring">
        <View style={styles.row}>
          {ruleset.pointOptions.map((points) => {
            const active = pointsPerSet === points;
            return (
              <Pressable accessibilityLabel={`${points} points`} accessibilityRole="radio" accessibilityState={{ selected: active }} key={points} onPress={() => setPointsPerSet(points)} style={[styles.target, active && styles.targetActive]}>
                <Text style={[styles.targetValue, active && styles.inverse]}>{points}</Text>
                <Text style={[styles.targetLabel, active && styles.inverse]}>points</Text>
              </Pressable>
            );
          })}
        </View>
        <Segmented label="Best of" onChange={(value) => setBestOfSets(Number(value))} options={["1", "3", "5"].map((value) => ({ label: `Best of ${value}`, value }))} value={String(bestOfSets)} />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Win by 2{ruleset.pointCap ? ` (cap ${ruleset.pointCap})` : ""}</Text>
          <Switch accessibilityLabel="Win by 2" onValueChange={setWinByTwo} thumbColor={colors.s1} trackColor={{ false: colors.line, true: colors.acc }} value={winByTwo} />
        </View>
        <Text style={styles.muted}>{ruleset.scoring === "RALLY" ? "Rally scoring" : "Side-out scoring"} · {sport === "PICKLEBALL" ? "pickleball" : "badminton"} defaults</Text>
      </Group>

      <Group label="Teams">
        <View style={styles.teams}>
          <View style={styles.side}>
            <PlayerPicker excludeUserIds={pickedIds(teamAPlayer1)} label="Team A player" onSelect={setTeamAPlayer1} value={teamAPlayer1} />
            {matchType === "DOUBLES" ? <PlayerPicker excludeUserIds={pickedIds(teamAPlayer2)} label="Team A partner" onSelect={setTeamAPlayer2} value={teamAPlayer2} /> : null}
          </View>
          <Text style={styles.vs}>VS</Text>
          <View style={styles.side}>
            <PlayerPicker excludeUserIds={pickedIds(teamBPlayer1)} label="Team B player" onSelect={setTeamBPlayer1} value={teamBPlayer1} />
            {matchType === "DOUBLES" ? <PlayerPicker excludeUserIds={pickedIds(teamBPlayer2)} label="Team B partner" onSelect={setTeamBPlayer2} value={teamBPlayer2} /> : null}
          </View>
        </View>
      </Group>

      <View style={styles.row}>
        <View style={styles.flex}><TextField label="Round" placeholder="Round 1" {...field("round")} /></View>
        <View style={styles.flex}><TextField label="Court or venue" placeholder="Optional" {...field("location")} /></View>
      </View>

      <Group label="Officials (optional)">
        <PlayerPicker excludeUserIds={selectedPlayerIds} label="Scorekeeper" onSelect={setScorer} value={scorer} />
        <PlayerPicker excludeUserIds={[...selectedPlayerIds, ...(scorer ? [scorer.userId] : [])]} label="Referee" onSelect={setReferee} value={referee} />
      </Group>

      <Notice message={error} />
    </Screen>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const styles = useThemeStyles(createStyles);
  return <View style={styles.group}><Text style={styles.groupLabel}>{label}</Text>{children}</View>;
}

const createStyles = (colors: ThemeColors) => ({
  header: { alignItems: "center", flexDirection: "row", gap: 12 },
  group: { gap: 8 },
  groupLabel: { color: colors.muted, fontFamily: fonts.bold, fontSize: 13 },
  row: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  sport: { backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 18, borderWidth: 1.5, flex: 1, gap: 4, justifyContent: "center", minHeight: 76, paddingHorizontal: 14 },
  sportName: { color: colors.text, fontFamily: fonts.display, fontSize: 24 },
  sportSub: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 12 },
  onAcc: { color: colors.onAcc },
  option: { backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 14, borderWidth: 1.5, gap: 2, padding: 12 },
  optionActive: { borderColor: colors.acc },
  optionTitle: { color: colors.text, fontFamily: fonts.heavy, fontSize: 14 },
  optionMeta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  target: { alignItems: "center", backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 14, borderWidth: 1.5, flex: 1, gap: 2, justifyContent: "center", minHeight: 64 },
  targetActive: { backgroundColor: colors.text, borderColor: colors.text },
  targetValue: { color: colors.text, fontFamily: fonts.display, fontSize: 28, lineHeight: 30 },
  targetLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 11 },
  inverse: { color: colors.bg },
  switchRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 44 },
  switchLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  muted: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  teams: { alignItems: "center", flexDirection: "row", gap: 10 },
  side: { flex: 1, gap: 6 },
  vs: { color: colors.muted, fontFamily: fonts.display, fontSize: 22 },
});
