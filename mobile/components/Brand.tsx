import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

// Pickelton mark: a perforated ball with speed lines. Brand colours are fixed in both themes.
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg height={size} viewBox="0 0 112 112" width={size}>
        <Circle cx="54" cy="48" fill="#C8F03C" r="34" />
        <G fill="#0C100E">
          <Circle cx="42" cy="34" r="4" /><Circle cx="60" cy="30" r="4" /><Circle cx="70" cy="48" r="4" />
          <Circle cx="58" cy="64" r="4" /><Circle cx="40" cy="56" r="4" /><Circle cx="54" cy="47" r="3.2" />
        </G>
        <Path d="M4 34h12M0 48h12M6 62h10" stroke="#C8F03C" strokeLinecap="round" strokeWidth="5" />
      </Svg>
    </View>
  );
}

export function PulseDot({ color, size = 8 }: { color: string; size?: number }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { duration: 600, toValue: 0.35, useNativeDriver: true }),
      Animated.timing(opacity, { duration: 600, toValue: 1, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={{ backgroundColor: color, borderRadius: size / 2, height: size, opacity, width: size }} />;
}
