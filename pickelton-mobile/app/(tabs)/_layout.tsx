// pickelton-mobile/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { AnimatedTabIcon } from "../../components/AnimatedTabIcon";
import { useTheme } from "../../theme/ThemeProvider";

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveBackgroundColor: colors.primary,
      tabBarActiveTintColor: colors.background,
      tabBarInactiveTintColor: colors.muted,
      tabBarLabelStyle: { fontSize: 9, fontWeight: "900", letterSpacing: 0.4, marginBottom: 6 },
      tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border, height: 72, paddingHorizontal: 8, paddingTop: 7 },
      tabBarItemStyle: { borderRadius: 18, marginHorizontal: 2 },
    }}>
      <Tabs.Screen name="index" options={{ title: "HOME", tabBarIcon: ({ color, focused, size }) => <AnimatedTabIcon color={color} focused={focused} name="home-outline" size={size} /> }} />
      <Tabs.Screen name="clubs" options={{ title: "CLUBS", tabBarIcon: ({ color, focused, size }) => <AnimatedTabIcon color={color} focused={focused} name="people-outline" size={size} /> }} />
      <Tabs.Screen name="tournaments" options={{ title: "EVENTS", tabBarIcon: ({ color, focused, size }) => <AnimatedTabIcon color={color} focused={focused} name="trophy-outline" size={size} /> }} />
      <Tabs.Screen name="community" options={{ title: "COMMUNITY", tabBarIcon: ({ color, focused, size }) => <AnimatedTabIcon color={color} focused={focused} name="chatbubbles-outline" size={size} /> }} />
    </Tabs>
  );
}
