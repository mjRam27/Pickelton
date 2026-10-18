import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { Avatar, toneFor } from "../../components/Avatar";
import { Card } from "../../components/Card";
import { EmptyState, LoadingState } from "../../components/EmptyState";
import { Notice } from "../../components/Notice";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { Display } from "../../components/Typography";
import { apiErrorMessage, fetchCommunity, updateMyCity, type Club } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

export default function ClubsScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [locationLabel, setLocationLabel] = useState("");
  const filtered = useMemo(() => clubs.filter((club) => `${club.name} ${club.location}`.toLowerCase().includes(query.trim().toLowerCase())), [clubs, query]);

  useEffect(() => { void loadNearby(); }, []);

  async function loadNearby() {
    setLoading(true);
    setError("");
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setClubs(await fetchCommunity());
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      const places = await Location.reverseGeocodeAsync(coordinates);
      const city = places[0]?.city ?? places[0]?.subregion ?? "";
      setLocationLabel(city);
      setClubs(await fetchCommunity(coordinates));
      if (city) await updateMyCity(city).catch(() => undefined);
    } catch (cause) {
      setError(apiErrorMessage(cause));
      fetchCommunity().then(setClubs).catch(() => undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen onRefresh={loadNearby} refreshing={loading && clubs.length > 0}>
      <View style={styles.header}>
        <Display size={44}>Clubs</Display>
        {locationLabel ? <Text style={styles.location}>{locationLabel}</Text> : null}
      </View>
      <TextField accessibilityLabel="Search clubs" autoCapitalize="none" icon="search" onChangeText={setQuery} placeholder="Search clubs or locations" returnKeyType="search" value={query} />
      <Notice message={error} />
      {loading && !clubs.length ? <LoadingState label="Finding clubs near you" /> : filtered.length ? filtered.map((club) => (
        <Card accessibilityLabel={`${club.name}, ${club.memberCount ?? 0} members`} key={club.id} onPress={() => router.push({ pathname: "/clubs/[id]", params: { id: club.id } })} style={styles.club}>
          <Avatar display name={club.name} size={52} square tone={toneFor(club.id)} />
          <View style={styles.clubCopy}>
            <Text numberOfLines={1} style={styles.clubName}>{club.name}</Text>
            <Text numberOfLines={1} style={styles.clubWhere}>{[club.location || "Location pending", club.distanceKm != null ? `${club.distanceKm.toFixed(1)} km` : null].filter(Boolean).join(" · ")}</Text>
            <Text style={styles.members}>{club.memberCount ?? 0} members</Text>
          </View>
          <Ionicons color={colors.muted} name="chevron-forward" size={20} />
        </Card>
      )) : <EmptyState copy={query ? "No clubs match that search. Try a different name or city." : "No clubs nearby yet. Check back after a local club is created."} icon="people-outline" title="No clubs in view" />}
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => ({
  header: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", paddingTop: 8 },
  location: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 13, marginBottom: 6 },
  club: { alignItems: "center", flexDirection: "row", gap: 14 },
  clubCopy: { flex: 1, gap: 4 },
  clubName: { color: colors.text, fontFamily: fonts.heavy, fontSize: 15 },
  clubWhere: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  members: { color: colors.accInk, fontFamily: fonts.bold, fontSize: 12 },
});
