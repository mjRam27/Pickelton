import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";
import { CardContainer } from "../../components/CardContainer";
import { EmptyState } from "../../components/EmptyState";
import { ScreenIntro } from "../../components/ScreenIntro";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusPill } from "../../components/StatusPill";
import { apiErrorMessage, fetchCommunity, type Club } from "../../services/api";
import type { ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

export default function ClubsScreen() {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const filtered = useMemo(() => clubs.filter((club) => `${club.name} ${club.location}`.toLowerCase().includes(query.toLowerCase())), [clubs, query]);

  useEffect(() => { fetchCommunity().then(setClubs).catch((cause) => setError(apiErrorMessage(cause))); }, []);

  return (
    <View style={styles.wrapper}><SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader eyebrow="LOCAL NETWORK" title="Clubs near you" />
        <ScreenIntro title="FIND YOUR" accent="COURT CROWD" copy="Search active communities, check their matchday rhythm, and join a club that feels like your game." />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search clubs or locations" placeholderTextColor={colors.muted} style={styles.search} />
        <SectionHeader title="ACTIVE CLUBS" action={`${filtered.length} FOUND`} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {filtered.length ? filtered.map((club) => (
          <Pressable key={club.id} onPress={() => router.push({ pathname: "/clubs/[id]", params: { id: club.id } })} style={({ pressed }) => pressed && styles.pressed}>
            <CardContainer style={styles.club}>
              <View style={styles.clubTop}><Text style={styles.clubName}>{club.name}</Text><StatusPill label={`${club.memberCount ?? 0} MEMBERS`} /></View>
              <Text style={styles.meta}>{club.location.toUpperCase()}</Text>
              <Text style={styles.copy}>{club.description || "A local Pickelton club building its next matchday roster."}</Text>
              <Text style={styles.open}>OPEN CLUB DETAILS</Text>
            </CardContainer>
          </Pressable>
        )) : <EmptyState title="NO CLUBS IN VIEW" copy="Try another search or check back after a new local club is created." />}
      </ScrollView>
    </SafeAreaView></View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 }, safe: { flex: 1 }, content: { padding: 18, paddingBottom: 28 },
  search: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, color: colors.text, fontSize: 13, marginTop: 20, minHeight: 48, paddingHorizontal: 14 },
  club: { borderTopColor: colors.primary, borderTopWidth: 3, gap: 7, marginBottom: 10 }, clubTop: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  clubName: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "900" }, meta: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  copy: { color: colors.text, fontSize: 11, lineHeight: 16 }, open: { color: colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.5, marginTop: 5 },
  error: { color: colors.danger, fontSize: 10, marginBottom: 12 }, pressed: { opacity: 0.8 },
});
