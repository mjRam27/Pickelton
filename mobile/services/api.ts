// pickelton-mobile/services/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { router } from "expo-router";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://YOUR_LOCAL_IP:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

let accessToken: string | null = null;
let currentUser: AuthUser | null = null;
const SESSION_KEY = "pickelton.auth.session.v1";
let refreshInFlight: Promise<AuthUser & { token: string }> | null = null;
const sessionStorage = {
  get: () => Platform.OS === "web" ? AsyncStorage.getItem(SESSION_KEY) : SecureStore.getItemAsync(SESSION_KEY),
  set: (value: string) => Platform.OS === "web" ? AsyncStorage.setItem(SESSION_KEY,value) : SecureStore.setItemAsync(SESSION_KEY,value,{keychainAccessible:SecureStore.AFTER_FIRST_UNLOCK}),
  remove: () => Platform.OS === "web" ? AsyncStorage.removeItem(SESSION_KEY) : SecureStore.deleteItemAsync(SESSION_KEY),
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// On 401 the access token has expired: swap the refresh token for a new pair and retry once.
// Only a rejected refresh token signs the user out; being offline doesn't.
api.interceptors.response.use(undefined, async (error) => {
  const original = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
  if (error.response?.status !== 401 || !original || original._retried || /\/auth\/(login|register|refresh|logout)$/.test(original.url ?? "")) throw error;
  original._retried = true;
  let session: AuthUser & { token: string };
  try {
    session = await refreshSession();
  } catch (refreshError) {
    if (sessionRejected(refreshError)) {
      await clearSession();
      router.replace("/(auth)/login");
    }
    throw error;
  }
  original.headers.Authorization = `Bearer ${session.token}`;
  return api.request(original);
});

// The server said the refresh token is no longer valid (as opposed to the phone being offline).
function sessionRejected(error: unknown) {
  const status = (error as { response?: { status?: number } } | undefined)?.response?.status;
  return status === 401 || status === 400 || (error instanceof Error && error.message === "No refresh token available");
}

function unwrap<T>(response: { data: { data: T } }) {
  return response.data.data;
}

export type LoginPayload = { email: string; password: string };
export type SignupPayload = { name: string; email: string; phoneNumber: string; dateOfBirth: string; password: string };
export type AuthUser = {
  token?: string;
  refreshToken?: string;
  userId?: string;
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  city?: string | null;
  createdAt?: string;
};
export type MatchPayload = { tournamentId?: string | null; player1Id: string; player2Id: string; round: string; [key: string]: unknown };
export type TeamCode = "A" | "B";
export type MatchParticipant = {
  id: string;
  userId: string;
  name: string;
  team: string | null;
  role: "PLAYER" | "SCORER" | "REFEREE";
  invitationStatus: string;
};
export type LiveScore = {
  matchId: string;
  status: string;
  currentScore: Record<string, number>;
  currentSet: number;
  setSummary: Array<Record<string, unknown>>;
  liveState: Record<string, unknown>;
  revision: number;
  updatedAt?: string;
};
export type MatchScorecard = {
  matchId: string;
  tournamentId?: string | null;
  round: string;
  status: string;
  venue?: string | null;
  scheduledAt?: string | null;
  participants: MatchParticipant[];
  scores: Record<string, number>;
  currentGameNumber: number;
  pointsToWin: number;
  bestOf: number;
  winByTwo: boolean;
  scorekeeperId?: string | null;
  winnerId?: string | null;
  revision: number;
  updatedAt?: string;
  createdAt?: string;
};
export type HostPayload = {
  fullName: string; dateOfBirth: string; phoneNumber: string; addressLine1: string; city: string; stateRegion: string;
  postalCode: string; idDocumentType: "AADHAAR"; idDocumentNumberLast4: string; documentImageUrl: string;
  selfieWithDocumentUrl: string; termsAccepted: true; dataProcessingConsent: true;
};
export type ClubPayload = { name: string; location: string; description?: string };
export type Club = { id: string; name: string; location: string; description?: string; memberCount?: number; latitude?: number; longitude?: number; distanceKm?: number | null; createdBy?: { id: string; name: string; email: string } };
export type ClubMember = { id: string; userId: string; name: string; email: string; role: "ADMIN" | "MEMBER" };
export type CommunityPost = { id: string; authorId: string; authorName: string; tag: string; content: string; createdAt: string };
export type CommunityPage = { content: CommunityPost[]; page: number; totalPages: number; last: boolean };
export type Tournament = {
  id: string; name: string; description?: string; sportType: string; tournamentType: string; status: string;
  clubId?: string; clubName?: string; entryFee?: number; maxPlayers: number; startDate: string;
  createdBy?: { id: string; name: string; email: string };
};
export type TournamentPayload = {
  name: string; description?: string; sportType: "PICKLEBALL" | "BADMINTON"; tournamentType: "SINGLES" | "DOUBLES";
  clubId?: string; entryFee: number; maxPlayers: number; startDate: string;
};
export type TournamentParticipant = { registrationId: string; userId: string; name: string; email: string; status: string };
export type LeaderboardEntry = { userId: string; name: string; email: string; played: number; won: number; lost: number; points: number };
export type Leaderboard = { tournamentId: string; entries: LeaderboardEntry[] };
export type HostVerification = {
  id: string; fullName: string; dateOfBirth: string; phoneNumber: string; addressLine1: string; city: string;
  stateRegion?: string; postalCode: string; idDocumentType: string; idDocumentNumberLast4: string; status: string;
  submittedAt: string; reviewedAt?: string; rejectionReason?: string;
};

export async function login(payload: LoginPayload) {
  const session = unwrap<AuthUser & { token: string }>(await api.post("/api/v1/auth/login", payload));
  await setSession(session);
  return session;
}

export async function signup(payload: SignupPayload) {
  const session = unwrap<AuthUser & { token: string }>(await api.post("/api/v1/auth/register", payload));
  await setSession(session);
  return session;
}

export function getCurrentUser() {
  return currentUser;
}

export async function initializeSession() {
  const stored = await sessionStorage.get();
  if (!stored) return false;
  try {
    const saved = JSON.parse(stored) as AuthUser & { token: string };
    accessToken = saved.token;
    currentUser = saved;
  } catch {
    await clearSession();
    return false;
  }
  try {
    await refreshSession();
  } catch (error) {
    // Offline or the server is down: keep the saved session and refresh later, when a request needs it.
    if (sessionRejected(error)) {
      await clearSession();
      return false;
    }
  }
  return true;
}

export type UserSearchResult = { userId: string; name: string; email: string; phoneNumber: string };

export async function searchUsers(query: string) {
  return unwrap<UserSearchResult[]>(await api.get("/api/v1/users/search", { params: { query, limit: 10 } }));
}

export type PlayerSuggestion = { userId: string; name: string; avatarUrl?: string | null; city?: string | null; lastPlayedAt?: string | null; following: boolean; reason: "RECENT_PLAYER" | "NEARBY" | "COMMUNITY" };
export async function fetchPlayerSuggestions() { return unwrap<PlayerSuggestion[]>(await api.get("/api/v1/users/suggestions")); }
export async function setPlayerFollow(userId: string, following: boolean) { return unwrap<{ following: boolean }>(following ? await api.post(`/api/v1/users/${userId}/follow`) : await api.delete(`/api/v1/users/${userId}/follow`)); }
export type UserStats = { userId: string; wins: number; losses: number; totalMatches: number };
export async function fetchUserStats(userId: string) { return unwrap<UserStats>(await api.get(`/api/v1/users/${userId}/stats`)); }

export async function fetchMyProfile() {
  const profile = unwrap<AuthUser>(await api.get("/api/v1/auth/me"));
  currentUser = { ...currentUser, ...profile };
  return currentUser;
}

// Ends every session of this account: other phones and browsers sign out within minutes.
export async function logoutEverywhere() {
  try {
    await api.post("/api/v1/auth/logout-all");
  } finally {
    await clearSession();
  }
}

export async function logout() {
  try {
    // Works even if the access token has expired: the refresh token alone ends this session.
    if (currentUser?.refreshToken) await api.post("/api/v1/auth/logout", { refreshToken: currentUser.refreshToken });
  } catch {
    // Logging out locally must still work when the API is briefly unreachable.
  } finally {
    await clearSession();
  }
}
export async function updateMyCity(city: string) { const profile=unwrap<AuthUser>(await api.put("/api/v1/users/me",{city}));currentUser={...currentUser,...profile};if(currentUser?.token)await sessionStorage.set(JSON.stringify(currentUser));return currentUser; }

async function setSession(session: AuthUser & { token: string }) {
  accessToken = session.token;
  currentUser = session;
  await sessionStorage.set(JSON.stringify(session));
}

async function clearSession() {
  accessToken = null;
  currentUser = null;
  await sessionStorage.remove();
}

async function refreshSession() {
  if (!currentUser?.refreshToken) throw new Error("No refresh token available");
  if (!refreshInFlight) {
    refreshInFlight = axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken: currentUser.refreshToken }, { timeout: 10000 })
      .then((response) => unwrap<AuthUser & { token: string }>(response))
      .then(async (session) => { await setSession(session); return session; })
      .finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

export async function createMatch(payload: MatchPayload) {
  return unwrap<{ id: string }>(await api.post("/api/matches", payload));
}

export async function fetchLiveScore(matchId: string) {
  return unwrap<LiveScore>(await api.get(`/api/matches/${matchId}/live-score`));
}

export async function addScorecardPoint(matchId: string, teamCode: TeamCode) {
  return unwrap<MatchScorecard>(await api.post(`/api/matches/${matchId}/scorecard/point`, { teamCode }));
}

export async function undoScorecardPoint(matchId: string) {
  return unwrap<MatchScorecard>(await api.post(`/api/matches/${matchId}/scorecard/undo`));
}

export async function correctScorecard(matchId: string, scoreA: number, scoreB: number, reason: string) {
  return unwrap<MatchScorecard>(await api.post(`/api/matches/${matchId}/scorecard/correction`, { scoreA, scoreB, reason }));
}

export async function completeScorecard(matchId: string) {
  return unwrap<MatchScorecard>(await api.post(`/api/matches/${matchId}/scorecard/complete`));
}

export async function applyHost(payload: HostPayload) {
  return unwrap(await api.post("/api/v1/host-verifications/me", payload));
}

export async function createClub(payload: ClubPayload) {
  return unwrap<Club>(await api.post("/api/clubs", payload));
}

export async function fetchCommunity(location?: { latitude: number; longitude: number }) {
  const page = unwrap<{ content: Club[] }>(await api.get("/api/clubs", { params: location }));
  return page.content;
}

export async function uploadKycDocument(uri: string) {
  const form = new FormData();
  form.append("file", { uri, name: `kyc-${Date.now()}.jpg`, type: "image/jpeg" } as unknown as Blob);
  return unwrap<{ path: string; url: string }>(await api.post("/api/v1/host-verifications/uploads", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }));
}

export async function fetchClub(id: string) {
  return unwrap<Club>(await api.get(`/api/clubs/${id}`));
}

export async function joinClub(id: string) {
  return unwrap(await api.post(`/api/clubs/${id}/join`));
}

export async function leaveClub(id: string) {
  return unwrap(await api.delete(`/api/clubs/${id}/leave`));
}

export async function fetchClubMembers(id: string) {
  const members = unwrap<Array<{ id: string; user?: { id: string; name?: string; email?: string }; userId?: string; name?: string; email?: string; role: "ADMIN" | "MEMBER" }>>(await api.get(`/api/clubs/${id}/members`));
  return members.map<ClubMember>((member) => ({ id: member.id, userId: member.user?.id ?? member.userId ?? "", name: member.user?.name ?? member.name ?? "Pickelton Player", email: member.user?.email ?? member.email ?? "", role: member.role }));
}

export async function updateClubMemberRole(id: string, userId: string, role: ClubMember["role"]) {
  return unwrap<ClubMember>(await api.patch(`/api/clubs/${id}/members/${userId}/role`, { role }));
}

export async function fetchCommunityPosts(page = 0) {
  return unwrap<CommunityPage>(await api.get("/api/community/posts", { params: { page, size: 10 } }));
}

export async function createCommunityPost(payload: { tag: string; content: string }) {
  return unwrap<CommunityPost>(await api.post("/api/community/posts", payload));
}

export async function deleteCommunityPost(id: string) {
  return unwrap(await api.delete(`/api/community/posts/${id}`));
}

export async function fetchTournaments() {
  const page = unwrap<{ content: Tournament[] }>(await api.get("/api/tournaments"));
  return page.content;
}
export async function fetchHostedTournaments() { return unwrap<Tournament[]>(await api.get("/api/tournaments/me/hosted")); }

export async function fetchTournament(id: string) {
  return unwrap<Tournament>(await api.get(`/api/tournaments/${id}`));
}

export async function registerTournament(id: string) {
  return unwrap(await api.post(`/api/tournaments/${id}/register`));
}

export async function cancelTournamentRegistration(id: string) {
  return unwrap(await api.delete(`/api/tournaments/${id}/register`));
}

export async function fetchTournamentParticipants(id: string) {
  return unwrap<TournamentParticipant[]>(await api.get(`/api/tournaments/${id}/participants`));
}

export async function fetchLeaderboard(id: string) {
  return unwrap<Leaderboard>(await api.get(`/api/tournaments/${id}/leaderboard`));
}

export async function fetchHostStatus() {
  return unwrap<HostVerification | null>(await api.get("/api/v1/host-verifications/me"));
}

export async function createTournament(payload: TournamentPayload) {
  return unwrap<Tournament>(await api.post("/api/tournaments", payload));
}

export function apiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.error?.message ?? error.response?.data?.message ?? error.message;
  return "Something went wrong. Please try again.";
}
