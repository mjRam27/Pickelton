// pickelton-mobile/app/+not-found.tsx
import { router } from "expo-router";
import { Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { Display } from "../components/Typography";
import { fonts, type ThemeColors } from "../theme/colors";
import { useTheme, useThemeStyles } from "../theme/ThemeProvider";

export default function NotFoundScreen() {
  const styles = useThemeStyles(createStyles);
  const { colors } = useTheme();
  return (
    <Screen
      footer={<>
        <Button label="Back to Home" onPress={() => router.replace("/(tabs)")} />
        <Button label="Browse events" onPress={() => router.replace("/(tabs)/tournaments")} variant="outline" />
      </>}
    >
      <Svg height={300} style={styles.art} viewBox="0 0 390 440" width="100%">
        <G fill="none" stroke={colors.line} strokeWidth={3}>
          <Path d="M60 40h270v380H60z" />
          <Path d="M60 230h270M195 40v120M195 300v120M60 160h270M60 300h270" />
        </G>
        <Path d="M120 400 Q240 120 352 70" fill="none" stroke={colors.acc} strokeDasharray="4 8" strokeWidth={2.5} />
        <Circle cx={356} cy={66} fill={colors.acc} r={22} />
        <G fill={colors.bg}><Circle cx={350} cy={58} r={3} /><Circle cx={364} cy={60} r={3} /><Circle cx={360} cy={74} r={3} /><Circle cx={348} cy={72} r={3} /></G>
        <Path d="M330 30 384 102" stroke={colors.hot} strokeLinecap="round" strokeWidth={3} />
      </Svg>
      <View style={styles.copyBlock}>
        <Text style={styles.eyebrow}>ERROR 404 · LINE CALL</Text>
        <Display size={96} style={styles.title}>{"That's\nout!"}</Display>
        <Text style={styles.copy}>This page landed past the baseline. It may have moved, or the link is from an event that has ended.</Text>
      </View>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) => ({
  art: { alignSelf: "center" },
  copyBlock: { gap: 8 },
  eyebrow: { color: colors.hotInk, fontFamily: fonts.heavy, fontSize: 13, letterSpacing: 1.5 },
  title: { lineHeight: 92 },
  copy: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
});
