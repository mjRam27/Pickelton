import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { Animated, Easing, Text, View } from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { Logo } from "../components/Brand";
import { initializeSession } from "../services/api";
import { fonts, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

// Splash: restores the saved session, then hands off to Home or Log in.
export default function SplashScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(progress, { duration: 1800, easing: Easing.out(Easing.quad), toValue: 1, useNativeDriver: false }));
    loop.start();
    initializeSession()
      .then((authenticated) => router.replace(authenticated ? "/(tabs)" : "/(auth)/login"))
      .catch(() => router.replace("/(auth)/login"));
    return () => loop.stop();
  }, [progress]);

  return (
    <View style={styles.wrapper}>
      <Svg height="100%" preserveAspectRatio="xMidYMid slice" style={styles.art} viewBox="0 0 390 844" width="100%">
        <G fill="none" opacity={0.16} stroke={colors.acc} strokeWidth={2}>
          <Rect height={664} width={310} x={40} y={90} />
          <Path d="M40 422h310M195 90v230M195 524v230M40 320h310M40 524h310" />
        </G>
        <Circle cx={330} cy={150} fill={colors.acc} opacity={0.07} r={140} />
        <Circle cx={40} cy={720} fill={colors.blu} opacity={0.06} r={180} />
      </Svg>
      <View accessibilityLabel="Pickelton" style={styles.brand}>
        <Logo size={112} />
        <Text style={styles.wordmark}>PICKELTON</Text>
        <Text style={styles.tagline}>Pickleball & badminton. Every rally counts.</Text>
      </View>
      <View style={styles.loader}>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
        </View>
        <Text style={styles.loading}>WARMING UP THE COURTS</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => ({
  wrapper: { alignItems: "center", backgroundColor: colors.bg, flex: 1, justifyContent: "center" },
  art: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  brand: { alignItems: "center", gap: 18 },
  wordmark: { color: colors.text, fontFamily: fonts.display, fontSize: 64, letterSpacing: 1.2, lineHeight: 64 },
  tagline: { color: colors.muted, fontFamily: fonts.medium, fontSize: 15 },
  loader: { alignItems: "center", bottom: 64, gap: 14, left: 0, position: "absolute", right: 0 },
  track: { backgroundColor: colors.s2, borderRadius: 4, height: 4, overflow: "hidden", width: 140 },
  bar: { backgroundColor: colors.acc, borderRadius: 4, height: 4 },
  loading: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1 },
});
