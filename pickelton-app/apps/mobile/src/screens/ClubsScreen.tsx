// pickelton-app/apps/mobile/src/screens/ClubsScreen.tsx
import { useEffect, useState } from "react";
import type { Club, CreateClubRequest } from "@pickelton/api";
import { Image, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { CardContainer } from "../components/CardContainer";
import { InputField } from "../components/InputField";
import { Plus, Users } from "../components/icons";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { SectionHeader } from "../components/SectionHeader";
import { clubs, images } from "../constants/mockData";
import { colors } from "../theme/colors";
import { errorMessage } from "../utils/errorMessage";

export function ClubsScreen({ onBack, onCommunity, onLoad, onCreate }: {
  onBack: () => void;
  onCommunity: () => void;
  onLoad: () => Promise<Club[]>;
  onCreate: (request: CreateClubRequest) => Promise<Club>;
}) {
  const [remoteClubs, setRemoteClubs] = useState<Club[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    onLoad().then(setRemoteClubs).catch((cause) => setError(errorMessage(cause)));
  }, [onLoad]);

  async function createClub() {
    setError("");
    setSuccess("");
    try {
      const club = await onCreate({ name: name.trim(), location: location.trim(), description: description.trim() });
      setRemoteClubs((current) => [club, ...current]);
      setSuccess("Club created.");
      setShowCreate(false);
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  return (
    <ScreenShell>
      <AppHeader onBack={onBack} />
      <Text style={styles.title}>ELEVATE YOUR{"\n"}GAME WITH{"\n"}<Text style={styles.lime}>NEW RIVALS.</Text></Text>
      <PrimaryButton label="CREATE A CLUB" Icon={Plus} onPress={() => setShowCreate((current) => !current)} style={styles.create} />
      {showCreate ? (
        <CardContainer style={styles.createForm}>
          <InputField label="CLUB NAME" placeholder="Westside Smashers" value={name} onChangeText={setName} />
          <InputField label="LOCATION" placeholder="Bengaluru" value={location} onChangeText={setLocation} />
          <InputField label="DESCRIPTION" placeholder="Describe your club" multiline value={description} onChangeText={setDescription} />
          <PrimaryButton label="CREATE CLUB" onPress={createClub} />
        </CardContainer>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <SectionHeader title="PINNED GROUP" />
      <CardContainer style={styles.pinned}>
        <Image source={{ uri: images.club }} style={styles.pinnedPhoto} />
        <Text style={styles.group}>WESTSIDE{"\n"}SMASHERS</Text>
        <Text style={styles.detail}>Pickleball  /  Bengaluru  /  128 members</Text>
      </CardContainer>
      <SectionHeader title="ACTIVE GROUPS" action="FEED" onPress={onCommunity} />
      {(remoteClubs.length ? remoteClubs : clubs).map((club) => (
        <CardContainer key={club.id} style={styles.row}>
          <Image source={{ uri: "image" in club ? club.image : images.club }} style={styles.thumb} />
          <View style={styles.grow}>
            <Text style={styles.name}>{club.name}</Text>
            <Text style={styles.detail}>{"sport" in club ? `${club.sport}  /  ${club.members}` : `${club.location}  /  ${club.memberCount} members`}</Text>
          </View>
          <PrimaryButton label="JOIN" variant="outline" style={styles.join} />
        </CardContainer>
      ))}
      <CardContainer style={styles.clubHome}>
        <Users size={21} color={colors.lime} />
        <View style={styles.grow}>
          <Text style={styles.name}>THE SMASH BUNKER</Text>
          <Text style={styles.detail}>Upcoming: Midnight Rally Series</Text>
        </View>
      </CardContainer>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 30, fontStyle: "italic", fontWeight: "900", lineHeight: 31 },
  lime: { color: colors.lime },
  create: { marginTop: 19 },
  createForm: { marginTop: 12, paddingBottom: 2 },
  pinned: { overflow: "hidden", padding: 0 },
  pinnedPhoto: { height: 112, opacity: 0.63, width: "100%" },
  group: { color: colors.text, fontSize: 20, fontStyle: "italic", fontWeight: "900", left: 13, lineHeight: 20, position: "absolute", top: 25 },
  detail: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  row: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 9, padding: 10 },
  thumb: { borderRadius: 6, height: 52, width: 52 },
  grow: { flex: 1 },
  name: { color: colors.text, fontSize: 13, fontWeight: "900", marginBottom: 5 },
  join: { minHeight: 34, paddingHorizontal: 10 },
  clubHome: { alignItems: "center", flexDirection: "row", gap: 14, marginTop: 13 },
  error: { color: colors.danger, fontSize: 10, lineHeight: 15, marginTop: 12 },
  success: { color: colors.lime, fontSize: 10, lineHeight: 15, marginTop: 12 },
});
