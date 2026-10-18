// pickelton-mobile/app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts } from "../../theme/colors";
import { useTheme } from "../../theme/ThemeProvider";

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(outline: IconName, filled: IconName) {
  return ({ color, focused }: { color: string; focused: boolean }) => <Ionicons color={color} name={focused ? filled : outline} size={24} />;
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      sceneStyle: { backgroundColor: colors.bg },
      tabBarActiveTintColor: colors.accInk,
      tabBarInactiveTintColor: colors.muted,
      tabBarLabelStyle: { fontFamily: fonts.heavy, fontSize: 11 },
      tabBarStyle: { backgroundColor: colors.s1, borderTopColor: colors.line, height: 62 + insets.bottom, paddingBottom: insets.bottom + 6, paddingTop: 8 },
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: tabIcon("home-outline", "home") }} />
      <Tabs.Screen name="clubs" options={{ title: "Clubs", tabBarIcon: tabIcon("people-outline", "people") }} />
      <Tabs.Screen name="tournaments" options={{ title: "Events", tabBarIcon: tabIcon("trophy-outline", "trophy") }} />
      <Tabs.Screen name="community" options={{ title: "Community", tabBarIcon: tabIcon("chatbubble-outline", "chatbubble") }} />
    </Tabs>
  );
}
