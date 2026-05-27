// pickelton-app/apps/mobile/src/screens/MatchCreationScreen.tsx
import { useState } from "react";
import type { CreateMatchRequest } from "@pickelton/api";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { CardContainer } from "../components/CardContainer";
import { InputField } from "../components/InputField";
import { MapPin, ShieldCheck, Swords, User, Users, Zap } from "../components/icons";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import type { LocalMatch, OfficialRole } from "../types/matchFlow";
import { colors, radius } from "../theme/colors";
import { errorMessage } from "../utils/errorMessage";

export function MatchCreationScreen({ onBack, onCreate }: {
  onBack: () => void;
  onCreate: (match: LocalMatch, request: CreateMatchRequest) => Promise<void>;
}) {
  const [mode, setMode] = useState("SINGLES");
  const [role, setRole] = useState<OfficialRole>("scorer");
  const [tournamentId, setTournamentId] = useState("");
  const [player1Id, setPlayer1Id] = useState("");
  const [player2Id, setPlayer2Id] = useState("");
  const [round, setRound] = useState("Round 1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createInvite() {
    setError("");
    setLoading(true);
    try {
      await onCreate({
        players: ["Marcus V.", "Elena R."],
        referee: role === "referee" ? "You" : null,
        scorer: role === "scorer" ? "You" : null,
        role,
        status: "invited",
      }, {
        tournamentId: tournamentId.trim(),
        player1Id: player1Id.trim(),
        player2Id: player2Id.trim(),
        round: round.trim(),
      });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenShell>
      <AppHeader onBack={onBack} />
      <Text style={styles.title}>CREATE MATCH</Text>
      <Text style={styles.subTitle}>SET UP YOUR GAME</Text>
      <Text style={styles.step}>01 - TACTICAL ALIGNMENT</Text>
      <View style={styles.segment}>
        {["SINGLES", "DOUBLES"].map((value) => (
          <Pressable key={value} onPress={() => setMode(value)} style={[styles.segmentPart, mode === value && styles.segmentOn]}>
            <Text style={[styles.segmentText, mode === value && styles.segmentTextOn]}>{value}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.step}>02 - COMBATANTS</Text>
      <InputField label="TOURNAMENT ID" icon={Users} placeholder="Tournament UUID" autoCapitalize="none" value={tournamentId} onChangeText={setTournamentId} />
      <InputField label="TEAM ALPHA ID" icon={User} placeholder="Registered player UUID" autoCapitalize="none" value={player1Id} onChangeText={setPlayer1Id} />
      <InputField label="TEAM BETA ID" icon={User} placeholder="Registered opponent UUID" autoCapitalize="none" value={player2Id} onChangeText={setPlayer2Id} />
      <Text style={styles.step}>03 - JURISDICTION</Text>
      <RoleCard title="REFEREE" detail="Enforce court rules" role="referee" selected={role === "referee"} onSelect={setRole} Icon={ShieldCheck} />
      <RoleCard title="SCORER" detail="Manage live match score" role="scorer" selected={role === "scorer"} onSelect={setRole} Icon={Swords} />
      <CardContainer style={styles.rules}>
        <Text style={styles.step}>04 - TECHNICAL SPECS</Text>
        <View style={styles.chips}>
          <Chip label="PICKLEBALL" active />
          <Chip label="BADMINTON" />
          <Chip label="21 PTS" active />
          <Chip label="BEST OF 3" active />
        </View>
        <InputField label="MATCH ROUND" placeholder="Round 1" value={round} onChangeText={setRound} />
        <InputField label="ARENA LOCATION" icon={MapPin} placeholder="Enter court arena" />
      </CardContainer>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label={loading ? "CREATING MATCH..." : "CREATE & SEND INVITES"} Icon={Zap} onPress={createInvite} disabled={loading} style={styles.submit} />
    </ScreenShell>
  );
}

function RoleCard({ title, detail, role, selected, onSelect, Icon }: {
  title: string;
  detail: string;
  role: OfficialRole;
  selected: boolean;
  onSelect: (role: OfficialRole) => void;
  Icon: typeof Swords;
}) {
  return (
    <Pressable onPress={() => onSelect(role)} style={[styles.role, selected && styles.roleSelected]}>
      <Icon size={22} color={selected ? colors.lime : colors.muted} />
      <View style={styles.grow}>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text style={styles.roleDetail}>{detail}</Text>
      </View>
      <Text style={[styles.roleBadge, selected && styles.roleBadgeSelected]}>{selected ? "SELECTED" : "ASSIGN"}</Text>
    </Pressable>
  );
}

function Chip({ label, active = false }: { label: string; active?: boolean }) {
  return <View style={[styles.chip, active && styles.chipOn]}><Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 30, fontStyle: "italic", fontWeight: "900", marginTop: 4 },
  subTitle: { color: colors.muted, fontSize: 10, fontWeight: "800", marginBottom: 26, marginTop: 5 },
  step: { color: colors.lime, fontSize: 9, fontWeight: "900", marginBottom: 12, marginTop: 10 },
  segment: { backgroundColor: "#030404", borderRadius: radius.sm, flexDirection: "row", marginBottom: 20, padding: 3 },
  segmentPart: { alignItems: "center", borderRadius: 4, flex: 1, justifyContent: "center", minHeight: 42 },
  segmentOn: { backgroundColor: colors.lime },
  segmentText: { color: colors.text, fontSize: 10, fontWeight: "900" },
  segmentTextOn: { color: colors.bg },
  role: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", gap: 13, marginBottom: 10, padding: 13 },
  roleSelected: { borderColor: colors.lime },
  grow: { flex: 1 },
  roleTitle: { color: colors.text, fontSize: 12, fontWeight: "900" },
  roleDetail: { color: colors.muted, fontSize: 10, marginTop: 5 },
  roleBadge: { color: colors.muted, fontSize: 8, fontWeight: "900" },
  roleBadgeSelected: { color: colors.lime },
  rules: { backgroundColor: "#070909", marginTop: 12, paddingBottom: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  chip: { borderColor: colors.border, borderRadius: 5, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  chipOn: { borderColor: colors.lime },
  chipText: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  chipTextOn: { color: colors.lime },
  submit: { marginTop: 22 },
  error: { color: colors.danger, fontSize: 10, lineHeight: 15, marginTop: 13 },
});
