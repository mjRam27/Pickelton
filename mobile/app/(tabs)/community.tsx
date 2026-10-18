import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Avatar, toneFor } from "../../components/Avatar";
import { Badge, type BadgeTone } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState, LoadingState } from "../../components/EmptyState";
import { IconButton } from "../../components/IconButton";
import { Notice } from "../../components/Notice";
import { Screen } from "../../components/Screen";
import { Chips } from "../../components/Segmented";
import { TextField } from "../../components/TextField";
import { Display } from "../../components/Typography";
import { apiErrorMessage, createCommunityPost, deleteCommunityPost, fetchCommunityPosts, getCurrentUser, type CommunityPost } from "../../services/api";
import { fonts, type ThemeColors } from "../../theme/colors";
import { useTheme, useThemeStyles } from "../../theme/ThemeProvider";

const TAGS = ["MATCHDAY", "PARTNER WANTED", "CLUB UPDATE", "QUESTION"] as const;
const tagTone = (tag: string): BadgeTone => (tag === "PARTNER WANTED" ? "blue" : tag === "CLUB UPDATE" ? "hot" : "muted");

export default function CommunityScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [liked, setLiked] = useState<string[]>([]);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState<{ tag: string; content: string }>({ tag: "MATCHDAY", content: "" });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const currentId = getCurrentUser()?.userId ?? getCurrentUser()?.id;

  const load = useCallback(async (next: number, replace = false) => {
    setLoading(true);
    try {
      const result = await fetchCommunityPosts(next);
      const content = result.content ?? [];
      setPosts((current) => (replace ? content : [...current, ...content]));
      setPage(result.page);
      setLast(result.last);
      setError("");
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(0, true); }, [load]);

  async function submit() {
    if (!form.content.trim()) return;
    setPosting(true);
    try {
      const post = await createCommunityPost({ tag: form.tag, content: form.content.trim() });
      setPosts((current) => [post, ...current]);
      setForm({ tag: "MATCHDAY", content: "" });
      setComposing(false);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setPosting(false);
    }
  }

  async function remove(id: string) {
    try {
      await deleteCommunityPost(id);
      setPosts((current) => current.filter((post) => post.id !== id));
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  }

  return (
    <Screen onRefresh={() => load(0, true)} refreshing={loading && posts.length > 0}>
      <View style={styles.header}>
        <Display size={44}>Community</Display>
        <IconButton icon={composing ? "close" : "create-outline"} label={composing ? "Close new post" : "New post"} onPress={() => setComposing((value) => !value)} tone="accent" />
      </View>

      {composing ? (
        <Card style={styles.composer}>
          <Chips onChange={(tag) => setForm((current) => ({ ...current, tag }))} options={TAGS.map((tag) => ({ label: tag.charAt(0) + tag.slice(1).toLowerCase(), value: tag }))} tone="ink" value={form.tag} />
          <TextField accessibilityLabel="Post text" autoFocus multiline onChangeText={(content) => setForm((current) => ({ ...current, content }))} placeholder="What's happening on court?" value={form.content} />
          <Button disabled={!form.content.trim()} icon="send" label="Post" loading={posting} onPress={submit} size="md" />
        </Card>
      ) : null}

      <Notice message={error} />

      {loading && !posts.length ? <LoadingState label="Loading the feed" /> : posts.length ? posts.map((post) => {
        const isLiked = liked.includes(post.id);
        return (
          <Card key={post.id} style={styles.post}>
            <View style={styles.postTop}>
              <Avatar name={post.authorName} tone={toneFor(post.authorId)} />
              <View style={styles.author}>
                <Text numberOfLines={1} style={styles.authorName}>{post.authorName}</Text>
                <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
              </View>
              {post.tag && post.tag !== "MATCHDAY" ? <Badge label={post.tag} tone={tagTone(post.tag)} /> : null}
            </View>
            <Text style={styles.content}>{post.content}</Text>
            <View style={styles.postActions}>
              <Pressable accessibilityLabel={isLiked ? "Unlike" : "Like"} accessibilityRole="button" accessibilityState={{ selected: isLiked }} onPress={() => setLiked((current) => (isLiked ? current.filter((id) => id !== post.id) : [...current, post.id]))} style={styles.actionButton}>
                <Ionicons color={isLiked ? colors.hotInk : colors.muted} name={isLiked ? "heart" : "heart-outline"} size={20} />
                <Text style={[styles.actionText, isLiked && { color: colors.hotInk }]}>{isLiked ? "Liked" : "Like"}</Text>
              </Pressable>
              {post.authorId === currentId ? (
                <Pressable accessibilityLabel="Delete post" accessibilityRole="button" onPress={() => remove(post.id)} style={styles.actionButton}>
                  <Ionicons color={colors.muted} name="trash-outline" size={19} />
                  <Text style={styles.actionText}>Delete</Text>
                </Pressable>
              ) : null}
            </View>
          </Card>
        );
      }) : <EmptyState action="Write a post" copy="Share a result, find a partner or ask a question." icon="chatbubble-outline" onAction={() => setComposing(true)} title="The feed is quiet" />}

      {!last ? <Button label="Load more" loading={loading} onPress={() => load(page + 1)} size="md" variant="outline" /> : null}
    </Screen>
  );
}

function timeAgo(value: string) {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (!Number.isFinite(minutes)) return "";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h`;
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const createStyles = (colors: ThemeColors) => ({
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingTop: 8 },
  composer: { gap: 12 },
  post: { gap: 10 },
  postTop: { alignItems: "center", flexDirection: "row", gap: 10 },
  author: { flex: 1 },
  authorName: { color: colors.text, fontFamily: fonts.heavy, fontSize: 14 },
  time: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  content: { color: colors.text, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  postActions: { flexDirection: "row", gap: 18 },
  actionButton: { alignItems: "center", flexDirection: "row", gap: 6, minHeight: 44 },
  actionText: { color: colors.muted, fontFamily: fonts.bold, fontSize: 13 },
});
