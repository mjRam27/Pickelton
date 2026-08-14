import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";

export function AnimatedTabIcon({ color, focused, name, size }: {
  color: string;
  focused: boolean;
  name: keyof typeof Ionicons.glyphMap;
  size: number;
}) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.9)).current;

  useEffect(() => {
    Animated.spring(scale, {
      friction: 5,
      tension: 145,
      toValue: focused ? 1.14 : 0.9,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  return <Animated.View style={{ transform: [{ scale }] }}><Ionicons color={color} name={name} size={size} /></Animated.View>;
}
