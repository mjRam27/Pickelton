// pickelton-mobile/app/+not-found.tsx
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ThemeColors } from "../theme/colors";
import { useThemeStyles } from "../theme/ThemeProvider";

export default function NotFoundScreen() {
  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <Text style={styles.title}>SCREEN NOT FOUND</Text>
        <Link href="/" style={styles.link}>RETURN HOME</Link>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { backgroundColor: colors.background, flex: 1 },
  container: { alignItems: "center", flex: 1, justifyContent: "center", padding: 20 },
  title: { color: colors.text, fontSize: 22, fontWeight: "900" },
  link: { color: colors.primary, fontSize: 12, fontWeight: "900", marginTop: 18 },
});
