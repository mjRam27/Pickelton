// pickelton-app/apps/mobile/src/screens/CommunityScreen.tsx
import { useEffect, useState } from "react";
import type { Club, CreateClubRequest } from "@pickelton/api";
import { Image, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { CardContainer } from "../components/CardContainer";
import { InputField } from "../components/InputField";
import { MessageCircle, Plus, Share2 } from "../components/icons";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { images } from "../constants/mockData";
import { colors } from "../theme/colors";
import { errorMessage } from "../utils/errorMessage";

const posts = [
  { name: "Marcus V.", detail: "Training session complete. Sunday ladder is next.", image: images.live },
  { name: "Westside Smashers", detail: "Victory secured. Finals next weekend.", image: images.club },
  { name: "Elena R.", detail: "Looking for a doubles partner tonight.", image: images.court },
];

export function CommunityScreen({ onBack, onClubs, onLoadGroups, onCreateGroup }: {
  onBack: () => void;
  onClubs: () => void;
  onLoadGroups: () => Promise<Club[]>;
  onCreateGroup: (request: CreateClubRequest) => Promise<Club>;
}) {
  const [groups, setGroups] = useState<Club[]>([]);
  const [newGroup, setNewGroup] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    onLoadGroups().then(setGroups).catch((cause) => setError(errorMessage(cause)));
  }, [onLoadGroups]);

  async function createGroup() {
    setError("");
    setSuccess("");
    try {
      const group = await onCreateGroup({ name: newGroup.trim(), location: "Bengaluru", description: "Created from the Pickelton community." });
      setGroups((current) => [group, ...current]);
      setNewGroup("");
      setSuccess("Community group created.");
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  return (
    <ScreenShell>
      <AppHeader onBack={onBack} />
      <Text style={styles.heading}>PLAYER FEED</Text>
      <CardContainer style={styles.composer}>
        <Image source={{ uri: images.profile }} style={styles.avatar} />
        <View style={styles.prompt}>
          <InputField label="NEW GROUP" placeholder="Start a group..." value={newGroup} onChangeText={setNewGroup} />
        </View>
        <PrimaryButton label="POST" Icon={Plus} onPress={createGroup} style={styles.postButton} />
      </CardContainer>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      {(groups.length ? groups.map((group) => ({
        name: group.name,
        detail: `${group.description || "Community club"} - ${group.location}`,
        image: images.club,
      })) : posts).map((post) => (
        <CardContainer key={post.name} style={styles.card}>
          <View style={styles.userRow}>
            <Image source={{ uri: images.profile }} style={styles.smallAvatar} />
            <View>
              <Text style={styles.name}>{post.name}</Text>
              <Text style={styles.time}>2H AGO</Text>
            </View>
          </View>
          <Text style={styles.detail}>{post.detail}</Text>
          <Image source={{ uri: post.image }} style={styles.postImage} />
          <View style={styles.reactions}>
            <Text style={styles.likes}>124 LIKES</Text>
            <MessageCircle size={15} color={colors.muted} />
            <Share2 size={15} color={colors.muted} />
          </View>
        </CardContainer>
      ))}
      <PrimaryButton label="VIEW CLUBS & GROUPS" variant="outline" onPress={onClubs} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.text, fontSize: 24, fontStyle: "italic", fontWeight: "900", marginBottom: 18 },
  composer: { alignItems: "center", flexDirection: "row", gap: 11, marginBottom: 14, padding: 10 },
  avatar: { borderRadius: 19, height: 38, width: 38 },
  prompt: { flex: 1 },
  postButton: { minHeight: 34, paddingHorizontal: 11 },
  card: { gap: 12, marginBottom: 13, overflow: "hidden", padding: 12 },
  userRow: { alignItems: "center", flexDirection: "row", gap: 9 },
  smallAvatar: { borderRadius: 16, height: 32, width: 32 },
  name: { color: colors.text, fontSize: 12, fontWeight: "900" },
  time: { color: colors.muted, fontSize: 8, fontWeight: "800", marginTop: 3 },
  detail: { color: colors.text, fontSize: 12, lineHeight: 18 },
  postImage: { borderRadius: 7, height: 164, width: "100%" },
  reactions: { alignItems: "center", flexDirection: "row", gap: 17 },
  likes: { color: colors.lime, fontSize: 9, fontWeight: "800" },
  error: { color: colors.danger, fontSize: 10, lineHeight: 15, marginBottom: 12 },
  success: { color: colors.lime, fontSize: 10, lineHeight: 15, marginBottom: 12 },
});
