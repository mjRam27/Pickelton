import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("tabs expose clubs, tournaments, and community navigation", async () => {
  const layout = await source("app/(tabs)/_layout.tsx");
  for (const name of ["clubs", "tournaments", "community"]) assert.match(layout, new RegExp(`name="${name}"`));
  for (const icon of ["home-outline", "people-outline", "trophy-outline", "chatbubbles-outline"]) assert.match(layout, new RegExp(icon));
});

test("live scorer includes an animated pickleball broadcast demo", async () => {
  const scoring = await source("app/match/scoring.tsx");
  assert.match(scoring, /LIVE VIDEO/);
  assert.match(scoring, /Animated\.loop/);
  assert.match(scoring, /SIMULATED LIVE COURT FEED/);
  assert.match(scoring, /PointCommentaryToast/);
  assert.match(scoring, /PulseDot/);
});

test("home dashboard exposes live, schedule, action, and player-progress sections", async () => {
  const home = await source("app/(tabs)/index.tsx");
  for (const section of ["LIVE SCORES", "UPCOMING MATCHES", "QUICK ACTIONS", "YOUR VELOCITY"]) {
    assert.match(home, new RegExp(section));
  }
  assert.match(home, /liveMatches/);
  assert.match(home, /MATCHDAY RADAR/);
  assert.match(home, /MatchdayPopup/);
  assert.match(home, /3 COURTS ARE LIVE NOW/);
});

test("navigation and actions use restrained animated icon feedback", async () => {
  const layout = await source("app/(tabs)/_layout.tsx");
  const icon = await source("components/AnimatedTabIcon.tsx");
  const button = await source("components/PrimaryButton.tsx");
  assert.match(layout, /AnimatedTabIcon/);
  assert.match(icon, /Animated\.spring/);
  assert.match(button, /Animated\.spring/);
});

test("stitch stadium template drives the welcome screen and electric-lime palette", async () => {
  const welcome = await source("app/index.tsx");
  const colors = await source("theme/colors.ts");
  assert.match(welcome, /Elite Performance\./);
  assert.match(welcome, /EXPLORE MEMBERSHIP/);
  assert.match(colors, /primary: "#ccff00"/);
  assert.match(colors, /background: "#121212"/);
});

test("top-right avatar opens a reusable account menu with profile, clubs, host desk, and logout", async () => {
  const header = await source("components/AppHeader.tsx");
  const menu = await source("components/AccountMenu.tsx");
  const profile = await source("app/profile.tsx");
  assert.match(header, /Open account menu/);
  assert.match(menu, /My profile/);
  assert.match(menu, /My clubs/);
  assert.match(menu, /Host desk/);
  assert.match(menu, /LOG OUT/);
  assert.match(profile, /PERSONAL DETAILS/);
});

test("appearance menu supports persisted system, light, and dark themes", async () => {
  const menu = await source("components/AccountMenu.tsx");
  const provider = await source("theme/ThemeProvider.tsx");
  const colors = await source("theme/colors.ts");
  assert.match(menu, /APPEARANCE/);
  for (const mode of ["SYSTEM", "LIGHT", "DARK"]) assert.match(menu, new RegExp(mode));
  assert.match(provider, /AsyncStorage\.getItem/);
  assert.match(provider, /AsyncStorage\.setItem/);
  assert.match(colors, /lightColors/);
});

test("club list supports search and opens the club detail route", async () => {
  const clubs = await source("app/(tabs)/clubs.tsx");
  assert.match(clubs, /Search clubs or locations/);
  assert.match(clubs, /pathname: "\/clubs\/\[id\]"/);
});

test("club details expose live roster, join, leave, and admin role actions", async () => {
  const details = await source("app/clubs/[id].tsx");
  assert.match(details, /await joinClub\(id\)/);
  assert.match(details, /await leaveClub\(id\)/);
  assert.match(details, /updateClubMemberRole/);
  assert.match(details, /fetchClubMembers/);
});

test("community feed uses paginated post API with create, delete, and empty states", async () => {
  const community = await source("app/(tabs)/community.tsx");
  assert.match(community, /LATEST POSTS/);
  assert.match(community, /setLiked/);
  assert.match(community, /fetchCommunityPosts/);
  assert.match(community, /createCommunityPost/);
  assert.match(community, /deleteCommunityPost/);
  assert.match(community, /THE FEED IS QUIET/);
});

test("tournament flow contains details, registration, leaderboard, and host creation", async () => {
  const details = await source("app/tournaments/[id].tsx");
  const leaderboard = await source("app/tournaments/[id]/leaderboard.tsx");
  const create = await source("app/tournaments/create.tsx");
  assert.match(details, /registerTournament\(id\)/);
  assert.match(details, /cancelTournamentRegistration\(id\)/);
  assert.match(details, /OPEN LEADERBOARD/);
  assert.match(leaderboard, /LEADERBOARD/);
  assert.match(create, /PUBLISH TOURNAMENT/);
});

test("host flow exposes status and an upload-ready KYC shell", async () => {
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

test("api service targets the existing club, tournament, leaderboard, and host endpoints", async () => {
  const api = await source("services/api.ts");
  for (const endpoint of ["/api/clubs/${id}/join", "/api/clubs/${id}/leave", "/api/community/posts", "/api/tournaments/${id}/register", "/api/tournaments/${id}/leaderboard", "/api/v1/host-verifications/me"]) {
    assert.match(api, new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
