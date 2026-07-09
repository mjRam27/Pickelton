// pickelton-mobile/services/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://YOUR_LOCAL_IP:8080";
const REFRESH_TOKEN_KEY = "pickelton.refreshToken";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

let accessToken: string | null = null;
let refreshToken: string | null = null;
let currentUser: AuthUser | null = null;
let refreshPromise: Promise<AuthUser> | null = null;

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) throw error;
    const original = error.config as (typeof error.config & { _retry?: boolean });
    if (!original || original._retry || !refreshToken) throw error;

    original._retry = true;
    const session = await refreshSession();
    original.headers = original.headers ?? {};
    original.headers.Authorization = `Bearer ${session.token}`;
    return api(original);
  }
);

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
  bio?: string;
  avatarUrl?: string;
  city?: string;
  role?: "USER" | "HOST" | "ADMIN";
  createdAt?: string;
};
export type MatchPayload = { tournamentId: string; player1Id: string; player2Id: string; round: string };
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
export type Club = { id: string; name: string; location: string; city?: string; logoUrl?: string; description?: string; memberCount?: number; createdBy?: { id: string; name: string; email: string } };
export type PublicUserSummary = { id: string; name: string; avatarUrl?: string | null; city?: string | null };
export type ClubMember = { id: string; clubId: string; user: PublicUserSummary & { userId?: string }; role: "OWNER" | "ADMIN" | "MEMBER"; joinedAt?: string };
export type ClubInvitation = { id: string; clubId: string; clubName: string; invitedUser: PublicUserSummary; invitedBy: PublicUserSummary; status: "INVITED" | "ACCEPTED" | "DECLINED"; createdAt: string };
export type CommunityPost = { id: string; authorId: string; authorName: string; tag: string; content: string; createdAt: string };
export type CommunityPage = { content: CommunityPost[]; page: number; totalPages: number; last: boolean };
export type Tournament = {
  id: string; name: string; description?: string; sportType: string; tournamentType: string; status: string;
  clubId?: string; clubName?: string; entryFee?: number; maxPlayers: number; startDate: string; bannerUrl?: string;
  createdBy?: { id: string; name: string; email: string };
};
export type TournamentPayload = {
  name: string; description?: string; sportType: "PICKLEBALL"; tournamentType: "SINGLES" | "DOUBLES";
  clubId?: string; entryFee: number; maxPlayers: number; startDate: string;
};
export type TournamentParticipant = { registrationId: string; userId: string; name: string; email: string; status: string };
export type LeaderboardEntry = { userId: string; name: string; email: string; played: number; won: number; lost: number; points: number };
export type Leaderboard = { tournamentId: string; entries: LeaderboardEntry[] };
export type PlayerLeaderboardEntry = { userId: string; name: string; avatarUrl?: string; city?: string; matchesPlayed: number; wins: number; losses: number; rating: number };
export type ClubLeaderboardEntry = { clubId: string; name: string; logoUrl?: string; city?: string; matchesPlayed: number; wins: number; losses: number; rating: number };
export type TeamMember = { id: string; teamId: string; user: UserSearchResult; role: "CAPTAIN" | "MEMBER"; status: string; joinedAt: string };
export type TeamUp = { id: string; name: string; sportType: string; status: string; captain: UserSearchResult; members: TeamMember[]; createdAt: string };
export type TeamInvitation = { id: string; teamId: string; teamName: string; invitedUser: UserSearchResult; invitedBy: UserSearchResult; status: "INVITED" | "ACCEPTED" | "DECLINED"; createdAt: string };
export type FormFieldType = "SHORT_TEXT" | "LONG_TEXT" | "NUMBER" | "EMAIL" | "PHONE" | "DATE" | "DOB" | "DROPDOWN" | "MULTI_SELECT" | "RADIO" | "CHECKBOX" | "YES_NO" | "TEAM_NAME" | "PLAYER_NAME" | "CLUB_NAME" | "CATEGORY" | "GENDER" | "SKILL_LEVEL" | "JERSEY_SIZE" | "EMERGENCY_CONTACT" | "ADDRESS" | "CUSTOM";
export type RegistrationFormField = {
  id?: string; fieldKey: string; label: string; type: FormFieldType; placeholder?: string; helpText?: string;
  required: boolean; enabled: boolean; displayOrder: number; defaultValue?: Record<string, unknown>; validationRules?: Record<string, unknown>; options?: Record<string, unknown>;
};
export type RegistrationForm = { id: string; tournamentId: string; version: number; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; fields: RegistrationFormField[]; publishedAt?: string; createdAt: string };
export type RegistrationAnswer = { fieldId: string; value: Record<string, unknown> };
export type Registration = { id: string; userId: string; tournamentId: string; status: string; createdAt: string; updatedAt: string };
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

export async function hydrateSession() {
  if (accessToken) return currentUser;
  const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!storedRefreshToken) return null;
  refreshToken = storedRefreshToken;
  try {
    return await refreshSession();
  } catch {
    await clearSession();
    return null;
  }
}

export type UserSearchResult = { userId: string; name: string; avatarUrl?: string | null; city?: string | null; clubNames: string[] };

export async function searchUsers(query: string) {
  return unwrap<UserSearchResult[]>(await api.get("/api/v1/users/search", { params: { query, limit: 10 } }));
}

export async function fetchMyProfile() {
  const profile = unwrap<AuthUser>(await api.get("/api/v1/auth/me"));
  currentUser = { ...currentUser, ...profile };
  return currentUser;
}

export async function logout() {
  try {
    if (accessToken) await api.post("/api/v1/auth/logout", { refreshToken });
  } catch {
    // Logging out locally must still work when the API is briefly unreachable.
  } finally {
    await clearSession();
  }
}

export async function updateMyProfile(payload: Partial<Pick<AuthUser, "name" | "phoneNumber" | "bio" | "avatarUrl" | "city">>) {
  const profile = unwrap<AuthUser>(await api.put("/api/v1/users/me", payload));
  currentUser = { ...currentUser, ...profile };
  return currentUser;
}

export async function uploadProfileAvatar(uri: string) {
  const form = uploadForm(uri, "avatar");
  const profile = unwrap<AuthUser>(await api.post("/api/v1/users/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }));
  currentUser = { ...currentUser, ...profile };
  return currentUser;
}

async function setSession(session: AuthUser & { token: string }) {
  accessToken = session.token;
  refreshToken = session.refreshToken ?? null;
  currentUser = session;
  if (refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

async function refreshSession() {
  if (refreshPromise) return refreshPromise;
  if (!refreshToken) throw new Error("No refresh token available");
  refreshPromise = axios
    .post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken }, { timeout: 10000 })
    .then(async (response) => {
      const session = unwrap<AuthUser & { token: string }>(response);
      await setSession(session);
      return session;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

async function clearSession() {
  accessToken = null;
  refreshToken = null;
  currentUser = null;
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
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

export async function fetchCommunity() {
  const page = unwrap<{ content: Club[] }>(await api.get("/api/clubs"));
  return page.content;
}

export async function uploadKycDocument(uri: string) {
  const form = uploadForm(uri, "kyc");
  return unwrap<{ path: string; url: string }>(await api.post("/api/v1/host-verifications/uploads", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }));
}

function uploadForm(uri: string, prefix: string) {
  const form = new FormData();
  form.append("file", { uri, name: `${prefix}-${Date.now()}.jpg`, type: "image/jpeg" } as unknown as Blob);
  return form;
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
  return unwrap<ClubMember[]>(await api.get(`/api/clubs/${id}/members`));
}

export async function updateClubMemberRole(id: string, userId: string, role: ClubMember["role"]) {
  return unwrap<ClubMember>(await api.patch(`/api/clubs/${id}/members/${userId}/role`, { role }));
}

export async function uploadClubLogo(id: string, uri: string) {
  return unwrap<Club>(await api.post(`/api/clubs/${id}/logo`, uploadForm(uri, "club-logo"), {
    headers: { "Content-Type": "multipart/form-data" },
  }));
}

export async function inviteClubMember(id: string, userId: string) {
  return unwrap<ClubInvitation>(await api.post(`/api/clubs/${id}/invitations`, { userId }));
}

export async function fetchMyClubInvitations() {
  return unwrap<ClubInvitation[]>(await api.get("/api/clubs/invitations/me"));
}

export async function respondClubInvitation(id: string, status: "ACCEPTED" | "DECLINED") {
  return unwrap<ClubInvitation>(await api.patch(`/api/clubs/invitations/${id}`, null, { params: { status } }));
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

export async function fetchPlayerLeaderboard() {
  return unwrap<PlayerLeaderboardEntry[]>(await api.get("/api/leaderboards/players"));
}

export async function fetchClubLeaderboard() {
  return unwrap<ClubLeaderboardEntry[]>(await api.get("/api/leaderboards/clubs"));
}

export async function createTeam(payload: { name: string; sportType: "PICKLEBALL" }) {
  return unwrap<TeamUp>(await api.post("/api/teams", payload));
}

export async function fetchMyTeams() {
  return unwrap<TeamUp[]>(await api.get("/api/teams/me"));
}

export async function inviteTeamMember(teamId: string, userId: string) {
  return unwrap<TeamInvitation>(await api.post(`/api/teams/${teamId}/invitations`, { userId }));
}

export async function fetchMyTeamInvitations() {
  return unwrap<TeamInvitation[]>(await api.get("/api/teams/invitations/me"));
}

export async function respondTeamInvitation(id: string, status: "ACCEPTED" | "DECLINED") {
  return unwrap<TeamInvitation>(await api.patch(`/api/teams/invitations/${id}`, null, { params: { status } }));
}

export async function fetchRegistrationForm(tournamentId: string, published = false) {
  return unwrap<RegistrationForm>(await api.get(`/api/tournaments/${tournamentId}/registration-form${published ? "/published" : ""}`));
}

export async function saveRegistrationForm(tournamentId: string, fields: RegistrationFormField[]) {
  return unwrap<RegistrationForm>(await api.put(`/api/tournaments/${tournamentId}/registration-form`, { fields }));
}

export async function publishRegistrationForm(tournamentId: string) {
  return unwrap<RegistrationForm>(await api.post(`/api/tournaments/${tournamentId}/registration-form/publish`));
}

export async function submitTournamentRegistration(tournamentId: string, answers: RegistrationAnswer[]) {
  return unwrap<Registration>(await api.post(`/api/tournaments/${tournamentId}/registrations`, { answers }));
}

export async function reviewTournamentRegistration(tournamentId: string, registrationId: string, status: "APPROVED" | "REJECTED" | "WAITLISTED") {
  return unwrap<Registration>(await api.patch(`/api/tournaments/${tournamentId}/registrations/${registrationId}`, { status }));
}

export async function fetchHostStatus() {
  return unwrap<HostVerification | null>(await api.get("/api/v1/host-verifications/me"));
}

export async function createTournament(payload: TournamentPayload) {
  return unwrap<Tournament>(await api.post("/api/tournaments", payload));
}

export async function uploadTournamentBanner(id: string, uri: string) {
  return unwrap<Tournament>(await api.post(`/api/tournaments/${id}/banner`, uploadForm(uri, "tournament-banner"), {
    headers: { "Content-Type": "multipart/form-data" },
  }));
}

export function apiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.message ?? error.message;
  return "Something went wrong. Please try again.";
}
