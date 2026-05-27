// pickelton-app/apps/mobile/App.tsx
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PickeltonApp } from "./src/screens/PickeltonAppScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <PickeltonApp />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
