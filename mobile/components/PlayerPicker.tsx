// pickelton-mobile/components/PlayerPicker.tsx
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { apiErrorMessage, searchUsers, type UserSearchResult } from "../services/api";
import { fonts, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";
import { Avatar, toneFor } from "./Avatar";

type Props = {
  label: string;
  value: UserSearchResult | null;
  onSelect: (user: UserSearchResult | null) => void;
  // User ids already chosen elsewhere on the screen; hidden from results to avoid duplicate picks.
  excludeUserIds?: string[];
};

export function PlayerPicker({ label, value, onSelect, excludeUserIds = [] }: Props) {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (timer.current) clearTimeout(timer.current);
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }
    setLoading(true);
    let cancelled = false;
    timer.current = setTimeout(() => {
      searchUsers(trimmed)
        .then((found) => { if (!cancelled) { setResults(found); setError(""); } })
        .catch((cause) => { if (!cancelled) { setResults([]); setError(apiErrorMessage(cause)); } })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 300);
    return () => { cancelled = true; if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  function choose(user: UserSearchResult) {
    onSelect(user);
    setOpen(false);
    setQuery("");
    setResults([]);
    setError("");
  }

  if (value) {
    return (
      <Pressable accessibilityHint="Removes this player" accessibilityLabel={`${label}: ${value.name}`} onPress={() => onSelect(null)} style={styles.slot}>
        <Avatar name={value.name} size={26} tone={toneFor(value.userId)} />
        <Text numberOfLines={1} style={styles.slotName}>{value.name}</Text>
        <Ionicons color={colors.muted} name="close" size={16} />
      </Pressable>
    );
  }

  if (!open) {
    return (
      <Pressable accessibilityLabel={`Add ${label}`} accessibilityRole="button" onPress={() => setOpen(true)} style={styles.add}>
        <Ionicons color={colors.muted} name="add" size={18} />
        <Text style={styles.addText}>{label}</Text>
      </Pressable>
    );
  }

  const visible = results.filter((user) => !excludeUserIds.includes(user.userId));
  return (
    <View style={styles.search}>
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel={`Search for ${label}`}
          autoCapitalize="none"
          autoFocus
          onChangeText={setQuery}
          placeholder="Name, email or phone"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={query}
        />
        <Pressable accessibilityLabel="Cancel search" onPress={() => { setOpen(false); setQuery(""); }} style={styles.cancel}>
          <Ionicons color={colors.muted} name="close" size={18} />
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {query.trim().length >= 2 ? (
        loading ? <ActivityIndicator color={colors.accInk} style={styles.spinner} /> : visible.length ? visible.map((user) => (
          <Pressable key={user.userId} onPress={() => choose(user)} style={({ pressed }) => [styles.result, pressed && styles.pressed]}>
            <Avatar name={user.name} size={32} tone={toneFor(user.userId)} />
            <View style={styles.resultCopy}>
              <Text numberOfLines={1} style={styles.resultName}>{user.name}</Text>
              <Text numberOfLines={1} style={styles.resultMeta}>{user.email}</Text>
            </View>
          </Pressable>
        )) : <Text style={styles.hint}>No players found.</Text>
      ) : <Text style={styles.hint}>Type at least 2 characters.</Text>}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  slot: { alignItems: "center", backgroundColor: colors.s1, borderColor: colors.line, borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 8, minHeight: 44, paddingHorizontal: 10 },
  slotName: { color: colors.text, flex: 1, fontFamily: fonts.bold, fontSize: 13 },
  add: { alignItems: "center", borderColor: colors.line, borderRadius: 12, borderStyle: "dashed", borderWidth: 1.5, flexDirection: "row", gap: 6, justifyContent: "center", minHeight: 44, paddingHorizontal: 8 },
  addText: { color: colors.muted, fontFamily: fonts.bold, fontSize: 13 },
  search: { backgroundColor: colors.s1, borderColor: colors.acc, borderRadius: 12, borderWidth: 1.5, gap: 4, padding: 6 },
  inputRow: { alignItems: "center", flexDirection: "row" },
  input: { color: colors.text, flex: 1, fontFamily: fonts.regular, fontSize: 14, minHeight: 36, paddingHorizontal: 6 },
  cancel: { alignItems: "center", height: 36, justifyContent: "center", width: 32 },
  error: { color: colors.hotInk, fontFamily: fonts.semibold, fontSize: 12, paddingHorizontal: 6 },
  spinner: { paddingVertical: 8 },
  hint: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, paddingHorizontal: 6, paddingVertical: 6 },
  result: { alignItems: "center", borderRadius: 8, flexDirection: "row", gap: 8, padding: 6 },
  pressed: { backgroundColor: colors.s2 },
  resultCopy: { flex: 1 },
  resultName: { color: colors.text, fontFamily: fonts.bold, fontSize: 13 },
  resultMeta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 11 },
});
