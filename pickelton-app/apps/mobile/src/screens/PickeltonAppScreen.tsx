// pickelton-app/apps/mobile/src/screens/PickeltonAppScreen.tsx
import { useMemo, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createPickeltonApi } from "@pickelton/api";
import { ClubsScreen } from "./ClubsScreen";
import { CommunityScreen } from "./CommunityScreen";
import { HomeScreen } from "./HomeScreen";
import { HostApplicationScreen } from "./HostApplicationScreen";
import { LoginScreen } from "./LoginScreen";
import { MatchCreationScreen } from "./MatchCreationScreen";
import { MatchInviteScreen } from "./MatchInviteScreen";
import { ScoringScreen } from "./ScoringScreen";
import { SignupScreen } from "./SignupScreen";
import type { LocalMatch } from "../types/matchFlow";

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: { notice?: string } | undefined;
  Clubs: undefined;
  Community: undefined;
  MatchCreation: undefined;
  MatchInvite: { match: LocalMatch; matchId: string };
  Scoring: { match: LocalMatch; matchId?: string; isAuthorized: boolean };
  HostApplication: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

const initialMatch: LocalMatch = {
  players: ["C. Henderson", "M. Arisaka"],
  referee: null,
  scorer: null,
  role: "player",
  status: "created",
};

export function PickeltonApp() {
  const [token, setToken] = useState<string | null>(null);
  const api = useMemo(() => createPickeltonApi(apiBaseUrl, () => token), [token]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login">
        {({ navigation }) => (
          <LoginScreen
            onLogin={async (request) => {
              const session = await api.auth.login(request);
              setToken(session.token);
              navigation.reset({ index: 0, routes: [{ name: "Home" }] });
            }}
            onSignup={() => navigation.navigate("Signup")}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Signup">
        {({ navigation }) => (
          <SignupScreen
            onSignup={async (request) => {
              const session = await api.auth.register(request);
              setToken(session.token);
              navigation.reset({ index: 0, routes: [{ name: "Home" }] });
            }}
            onLogin={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Home">
        {({ navigation, route }) => (
          <HomeScreen
            notice={route.params?.notice}
            onCreateMatch={() => navigation.navigate("MatchCreation")}
            onScoring={() => navigation.navigate("Scoring", { match: { ...initialMatch, status: "live" }, isAuthorized: false })}
            onClubs={() => navigation.navigate("Clubs")}
            onCommunity={() => navigation.navigate("Community")}
            onHost={() => navigation.navigate("HostApplication")}
            onRequestPhoneCode={async () => {
              await api.auth.requestPhoneCode();
            }}
            onVerifyPhoneCode={async (code) => {
              await api.auth.verifyPhoneCode({ code: code.trim() });
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Clubs">
        {({ navigation }) => (
          <ClubsScreen
            onBack={() => navigation.goBack()}
            onCommunity={() => navigation.navigate("Community")}
            onLoad={() => api.clubs.list()}
            onCreate={(request) => api.clubs.create(request)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Community">
        {({ navigation }) => (
          <CommunityScreen
            onBack={() => navigation.goBack()}
            onClubs={() => navigation.navigate("Clubs")}
            onLoadGroups={() => api.clubs.list()}
            onCreateGroup={(request) => api.clubs.create(request)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MatchCreation">
        {({ navigation }) => (
          <MatchCreationScreen
            onBack={() => navigation.goBack()}
            onCreate={async (match, request) => {
              const created = await api.matches.create(request);
              navigation.navigate("MatchInvite", { match, matchId: created.id });
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MatchInvite">
        {({ navigation, route }) => (
          <MatchInviteScreen
            match={route.params.match}
            onDecline={() => navigation.navigate("Home")}
            onAccept={() => navigation.replace("Scoring", {
              match: { ...route.params.match, status: "accepted" },
              matchId: route.params.matchId,
              isAuthorized: route.params.match.role === "scorer" || route.params.match.role === "referee",
            })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Scoring">
        {({ navigation, route }) => (
          <ScoringScreen
            match={route.params.match}
            isAuthorized={route.params.isAuthorized}
            onBack={() => navigation.navigate("Home")}
            onLive={() => navigation.setParams({ match: { ...route.params.match, status: "live" } })}
            onEndMatch={() => navigation.setParams({ match: { ...route.params.match, status: "completed" } })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="HostApplication">
        {({ navigation }) => (
          <HostApplicationScreen
            onBack={() => navigation.goBack()}
            onSubmit={async (request) => {
              await api.hostVerification.submit(request);
              navigation.navigate("Home", { notice: "Host application submitted for verification." });
            }}
            onCreateTournament={async (request) => {
              await api.tournaments.create(request);
              navigation.navigate("Home", { notice: "Tournament created successfully." });
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
