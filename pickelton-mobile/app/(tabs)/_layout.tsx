// pickelton-mobile/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { colors } from "../../theme/colors";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
    }}>
      <Tabs.Screen name="index" options={{ title: "HOME" }} />
      <Tabs.Screen name="clubs" options={{ title: "CLUBS" }} />
      <Tabs.Screen name="community" options={{ title: "COMMUNITY" }} />
    </Tabs>
  );
}
