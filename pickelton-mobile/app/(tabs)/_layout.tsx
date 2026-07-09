// pickelton-mobile/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { AnimatedTabIcon } from "../../components/AnimatedTabIcon";
import { useTheme } from "../../theme/ThemeProvider";

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveBackgroundColor: colors.accentSoft,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.subtle,
      tabBarLabelStyle: { fontSize: 10, fontWeight: "600", letterSpacing: 0, marginBottom: 4 },
      tabBarStyle: { backgroundColor: "rgba(255,255,255,0.96)", borderTopColor: colors.border, height: 78, paddingHorizontal: 6, paddingTop: 8 },
      tabBarItemStyle: { borderRadius: 16, marginHorizontal: 1, paddingTop: 2 },
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, focused, size }) => <AnimatedTabIcon color={color} focused={focused} name="home-outline" size={size} /> }} />
      <Tabs.Screen name="play" options={{ title: "Play", tabBarIcon: ({ color, focused, size }) => <AnimatedTabIcon color={color} focused={focused} name="tennisball-outline" size={size} /> }} />
      <Tabs.Screen name="clubs" options={{ title: "Clubs", tabBarIcon: ({ color, focused, size }) => <AnimatedTabIcon color={color} focused={focused} name="trophy-outline" size={size} /> }} />
      <Tabs.Screen name="tournaments" options={{ title: "Events", tabBarIcon: ({ color, focused, size }) => <AnimatedTabIcon color={color} focused={focused} name="calendar-outline" size={size} /> }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, focused, size }) => <AnimatedTabIcon color={color} focused={focused} name="person-outline" size={size} /> }} />
    </Tabs>
  );
}
