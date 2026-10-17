import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Share, Text, View } from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { Avatar, toneFor } from "../../components/Avatar";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyState, LoadingState } from "../../components/EmptyState";
import { IconButton } from "../../components/IconButton";
import { Notice } from "../../components/Notice";
import { Screen } from "../../components/Screen";
import { Segmented } from "../../components/Segmented";
import { Display } from "../../components/Typography";
import { apiErrorMessage, fetchClub, fetchClubMembers, getCurrentUser, joinClub, leaveClub, updateClubMemberRole, type Club, type ClubMember } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useThemeStyles } from "../../theme/ThemeProvider";

export default function ClubDetailsScreen() {
  const styles = useThemeStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [tab, setTab] = useState<"about" | "members">("about");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const currentId = getCurrentUser()?.userId ?? getCurrentUser()?.id;
  const mine = members.find((member) => member.userId === currentId);
  const isAdmin = mine?.role === "ADMIN";
  const adminCount = members.filter((member) => member.role === "ADMIN").length;

  const load = useCallback(async () => {
    try {
      setError("");
      setClub(await fetchClub(id));
      setMembers(await fetchClubMembers(id));
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  }, [id]);

  useEffect(() => { if (id) void load(); }, [id, load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      setMessage(success);
      await load();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  const join = () => run(() => joinClub(id), "You joined the club. Welcome to the roster.");
  const leave = () => run(() => leaveClub(id), "You left the club.");
  const toggleRole = (member: ClubMember) => run(() => updateClubMemberRole(id, member.userId, member.role === "ADMIN" ? "MEMBER" : "ADMIN"), `${member.name || "Member"} is now ${member.role === "ADMIN" ? "a member" : "an admin"}.`);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/clubs"));

  if (!club) {
    return (
      <Screen>
        <IconButton icon="chevron-back" label="Back to clubs" onPress={back} />
        {error ? <EmptyState action="Try again" copy={error} icon="cloud-offline-outline" onAction={load} title="Couldn't load this club" /> : <LoadingState label="Loading club" />}
      </Screen>
    );
  }

  return (
    <Screen
      contentStyle={styles.content}
      footer={<Button label={mine ? "Leave this club" : "Join this club"} loading={busy} onPress={mine ? leave : join} variant={mine ? "outline" : "primary"} />}
    >
      <Hero onBack={back} onShare={() => Share.share({ message: `${club.name} on Pickelton · ${club.location}` })} />
      <Avatar display name={club.name} size={72} square style={styles.badge} tone={toneFor(club.id)} />
      <View style={styles.titleBlock}>
        <Display size={36}>{club.name}</Display>
        <Text style={styles.where}>{club.location || "Location pending"}</Text>
      </View>
      <View style={styles.stats}>
        <Stat label="Members" value={String(members.length)} />
        <Stat border label="Admins" value={String(adminCount)} />
        <Stat label="Your role" value={mine ? (mine.role === "ADMIN" ? "Admin" : "Member") : "Guest"} />
      </View>
      <Notice message={message} tone="success" />
      <Notice message={error} />
      <Segmented label="Club sections" onChange={setTab} options={[{ label: "About", value: "about" }, { label: `Members (${members.length})`, value: "members" }]} value={tab} />
      {tab === "about" ? (
        <Text style={styles.about}>{club.description || "This club hasn't added a description yet."}</Text>
      ) : members.length ? members.map((member) => {
        const name = member.name || "Pickelton player";
        const canManage = isAdmin && member.userId !== currentId;
        return (
          <View key={member.id} style={styles.member}>
            <Avatar name={name} size={36} tone={toneFor(member.userId)} />
            <Text numberOfLines={1} style={styles.memberName}>{name}</Text>
            {canManage ? (
              <Pressable accessibilityRole="button" disabled={busy} onPress={() => toggleRole(member)} style={styles.roleButton}>
                <Text style={styles.roleText}>{member.role === "ADMIN" ? "Demote" : "Make admin"}</Text>
              </Pressable>
            ) : <Badge label={member.role === "ADMIN" ? "Admin" : "Member"} tone={member.role === "ADMIN" ? "accent" : "muted"} />}
          </View>
        );
      }) : <EmptyState copy="Join the club to become its first regular." icon="people-outline" title="No members yet" />}
    </Screen>
  );
}

function Hero({ onBack, onShare }: { onBack: () => void; onShare: () => void }) {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.hero}>
      <Svg height="100%" preserveAspectRatio="xMidYMid slice" style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }} viewBox="0 0 390 210" width="100%">
        <Rect fill="#2B5A12" height={210} width={390} />
        <G fill="none" opacity={0.55} stroke="#C8F03C" strokeWidth={3} transform="rotate(-8 195 105)">
          <Rect height={160} width={430} x={-20} y={30} />
          <Path d="M-20 110h430M195 30v160" />
          <Path d="M110 30v160M280 30v160" strokeDasharray="6 8" />
        </G>
        <Circle cx={320} cy={60} fill="#C8F03C" r={26} />
        <G fill="#2B5A12"><Circle cx={312} cy={52} r={3} /><Circle cx={328} cy={50} r={3} /><Circle cx={332} cy={66} r={3} /><Circle cx={316} cy={70} r={3} /></G>
      </Svg>
      <View style={styles.heroBar}>
        <IconButton icon="chevron-back" label="Back to clubs" onPress={onBack} tone="overlay" />
        <IconButton icon="share-outline" label="Share club" onPress={onShare} tone="overlay" />
      </View>
    </View>
  );
}

function Stat({ value, label, border = false }: { value: string; label: string; border?: boolean }) {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={[styles.stat, border && styles.statBorder]}>
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  hero: { height: 190, marginHorizontal: -20, overflow: "hidden" },
  heroBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12 },
  content: { paddingTop: 0 },
  badge: { borderColor: colors.bg, borderWidth: 4, height: 72, marginTop: -52, width: 72 },
  titleBlock: { gap: 4 },
  where: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14 },
  stats: { backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 18, borderWidth: 1, flexDirection: "row" },
  stat: { alignItems: "center", flex: 1, gap: 2, padding: 12 },
  statBorder: { borderColor: colors.line, borderLeftWidth: 1, borderRightWidth: 1 },
  statValue: { color: colors.text, fontFamily: fonts.display, fontSize: 28, lineHeight: 30 },
  statLabel: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  about: { color: colors.text, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  member: { alignItems: "center", backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 12, paddingHorizontal: 12, paddingVertical: 10 },
  memberName: { color: colors.text, flex: 1, fontFamily: fonts.bold, fontSize: 14 },
  roleButton: { borderColor: colors.line, borderRadius: 10, borderWidth: 1.5, justifyContent: "center", minHeight: 36, paddingHorizontal: 10 },
  roleText: { color: colors.text, fontFamily: fonts.heavy, fontSize: 12 },
});
