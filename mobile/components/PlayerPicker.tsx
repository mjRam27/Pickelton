// pickelton-mobile/components/PlayerPicker.tsx
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { apiErrorMessage, searchUsers, type UserSearchResult } from "../services/api";
import { radius, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

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
    setQuery("");
    setResults([]);
    setError("");
  }

  if (value) {
    return (
      <View style={styles.group}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.selected}>
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedName}>{value.name}</Text>
            <Text style={styles.selectedMeta}>{value.email}</Text>
          </View>
          <Pressable accessibilityLabel={`Change ${label}`} onPress={() => onSelect(null)} style={styles.change}>
            <Text style={styles.changeText}>CHANGE</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const visible = results.filter((user) => !excludeUserIds.includes(user.userId));

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name, email, or phone"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {query.trim().length >= 2 ? (
        <View style={styles.list}>
          {loading ? (
            <Text style={styles.hint}>Searching…</Text>
          ) : visible.length ? (
            visible.map((user) => (
              <Pressable key={user.userId} onPress={() => choose(user)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                <Text style={styles.rowName}>{user.name}</Text>
                <Text style={styles.rowMeta}>{user.email} · {user.phoneNumber}</Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.hint}>No players found.</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  group: { gap: 8, marginBottom: 15 },
  label: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.text, fontSize: 13, minHeight: 52, paddingHorizontal: 14 },
  error: { color: colors.danger, fontSize: 10 },
  hint: { color: colors.muted, fontSize: 11, paddingHorizontal: 14, paddingVertical: 12 },
  list: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, overflow: "hidden" },
  row: { borderBottomColor: colors.border, borderBottomWidth: 1, gap: 3, paddingHorizontal: 14, paddingVertical: 11 },
  pressed: { backgroundColor: colors.raised },
  rowName: { color: colors.text, fontSize: 13, fontWeight: "800" },
  rowMeta: { color: colors.muted, fontSize: 10 },
  selected: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.primary, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", gap: 8, minHeight: 52, paddingHorizontal: 14, paddingVertical: 8 },
  selectedInfo: { flex: 1, gap: 3 },
  selectedName: { color: colors.text, fontSize: 13, fontWeight: "800" },
  selectedMeta: { color: colors.muted, fontSize: 10 },
  change: { paddingHorizontal: 6, paddingVertical: 4 },
  changeText: { color: colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
});
