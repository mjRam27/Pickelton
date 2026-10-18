import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("tabs expose home, clubs, events and community", async () => {
  const layout = await source("app/(tabs)/_layout.tsx");
  for (const name of ["index", "clubs", "tournaments", "community"]) assert.match(layout, new RegExp(`name="${name}"`));
  for (const title of ["Home", "Clubs", "Events", "Community"]) assert.match(layout, new RegExp(`title: "${title}"`));
});

test("theme uses the shared design tokens in light and dark", async () => {
  const colors = await source("theme/colors.ts");
  const tokens = await readFile(new URL("../../packages/constants/src/theme.ts", import.meta.url), "utf8");
  const provider = await source("theme/ThemeProvider.tsx");
  assert.match(colors, /@pickelton\/constants/);
  assert.match(tokens, /acc: "#C8F03C"/);
  assert.match(tokens, /bg: "#0C100E"/);
  assert.match(tokens, /lightPalette/);
  assert.match(provider, /AsyncStorage\.getItem/);
  assert.match(provider, /AsyncStorage\.setItem/);
});

test("root layout loads the Archivo and Big Shoulders fonts", async () => {
  const layout = await source("app/_layout.tsx");
  assert.match(layout, /useFonts/);
  assert.match(layout, /Archivo_800ExtraBold/);
  assert.match(layout, /BigShouldersDisplay_900Black/);
});

test("settings sheet supports persisted system, light and dark themes and log out", async () => {
  const sheet = await source("components/SettingsSheet.tsx");
  for (const mode of ["System", "Light", "Dark"]) assert.match(sheet, new RegExp(`label: "${mode}"`));
  assert.match(sheet, /logout\(\)/);
  assert.match(await source("app/profile.tsx"), /SettingsSheet/);
});

test("splash restores the session before routing", async () => {
  const splash = await source("app/index.tsx");
  assert.match(splash, /initializeSession/);
  assert.match(splash, /WARMING UP THE COURTS/);
});

test("home uses live data, not mock matches", async () => {
  const home = await source("app/(tabs)/index.tsx");
  for (const call of ["fetchUserStats", "fetchTournaments", "fetchPlayerSuggestions"]) assert.match(home, new RegExp(call));
  assert.doesNotMatch(home, /liveMatches/);
});

test("club list supports search and opens the club detail route", async () => {
  const clubs = await source("app/(tabs)/clubs.tsx");
  assert.match(clubs, /Search clubs or locations/);
  assert.match(clubs, /pathname: "\/clubs\/\[id\]"/);
});

test("club details expose roster, join, leave and admin role actions", async () => {
  const details = await source("app/clubs/[id].tsx");
  assert.match(details, /joinClub\(id\)/);
  assert.match(details, /leaveClub\(id\)/);
  assert.match(details, /updateClubMemberRole/);
  assert.match(details, /fetchClubMembers/);
});

test("community feed uses paginated post API with create, delete and empty states", async () => {
  const community = await source("app/(tabs)/community.tsx");
  for (const call of ["fetchCommunityPosts", "createCommunityPost", "deleteCommunityPost", "setLiked"]) assert.match(community, new RegExp(call));
  assert.match(community, /The feed is quiet/);
});

test("tournament flow contains details, registration, leaderboard and host creation", async () => {
  const details = await source("app/tournaments/[id].tsx");
  const leaderboard = await source("app/tournaments/[id]/leaderboard.tsx");
  const create = await source("app/tournaments/create.tsx");
  const list = await source("app/(tabs)/tournaments.tsx");
  assert.match(details, /registerTournament\(id\)/);
  assert.match(details, /cancelTournamentRegistration\(id\)/);
  assert.match(leaderboard, /fetchLeaderboard/);
  assert.match(create, /Publish tournament/);
  assert.match(create, /BADMINTON/);
  assert.doesNotMatch(list, /showcase/);
});

test("match creation reads per-sport rulesets instead of hard-coded scoring", async () => {
  const create = await source("app/match/create.tsx");
  assert.match(create, /rulesets/);
  assert.match(create, /createMatch/);
});

test("live scorer records, undoes and completes points through the scorecard API", async () => {
  const scoring = await source("app/match/scoring.tsx");
  for (const call of ["addScorecardPoint", "undoScorecardPoint", "completeScorecard", "fetchLiveScore"]) assert.match(scoring, new RegExp(call));
});

test("host flow exposes status and an upload-ready KYC form", async () => {
  const status = await source("app/host/status.tsx");
  const apply = await source("app/host/apply.tsx");
  assert.match(status, /fetchHostStatus/);
  assert.match(apply, /AADHAAR DOCUMENT/);
  assert.match(apply, /launchImageLibraryAsync/);
  assert.match(apply, /uploadKycDocument/);
});

test("backend migration configures a private Supabase KYC storage bucket", async () => {
  const migration = await readFile(new URL("../../backend/src/main/resources/db/supabase_schema.sql", import.meta.url), "utf8");
  assert.match(migration, /'kyc-documents', 'kyc-documents', false/);
  assert.match(migration, /kyc users upload own documents/);
  assert.match(migration, /kyc users read own documents/);
});

test("api service targets the existing club, tournament, leaderboard, stats and host endpoints", async () => {
  const api = await source("services/api.ts");
  for (const endpoint of ["/api/clubs/${id}/join", "/api/clubs/${id}/leave", "/api/community/posts", "/api/tournaments/${id}/register", "/api/tournaments/${id}/leaderboard", "/api/v1/host-verifications/me", "/api/v1/users/${userId}/stats"]) {
    assert.match(api, new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
