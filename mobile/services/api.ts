// pickelton-mobile/services/api.ts
import axios from "axios";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://YOUR_LOCAL_IP:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

let accessToken: string | null = null;
let currentUser: AuthUser | null = null;

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

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
export type Club = { id: string; name: string; location: string; description?: string; memberCount?: number; createdBy?: { id: string; name: string; email: string } };
export type ClubMember = { id: string; userId: string; name: string; email: string; role: "ADMIN" | "MEMBER" };
export type CommunityPost = { id: string; authorId: string; authorName: string; tag: string; content: string; createdAt: string };
export type CommunityPage = { content: CommunityPost[]; page: number; totalPages: number; last: boolean };
export type Tournament = {
  id: string; name: string; description?: string; sportType: string; tournamentType: string; status: string;
  clubId?: string; clubName?: string; entryFee?: number; maxPlayers: number; startDate: string;
  createdBy?: { id: string; name: string; email: string };
};
export type TournamentPayload = {
  name: string; description?: string; sportType: "PICKLEBALL"; tournamentType: "SINGLES" | "DOUBLES";
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
  setSession(session);
  return session;
}

export async function signup(payload: SignupPayload) {
  const session = unwrap<AuthUser & { token: string }>(await api.post("/api/v1/auth/register", payload));
  setSession(session);
  return session;
}

export function getCurrentUser() {
  return currentUser;
}

export type UserSearchResult = { userId: string; name: string; email: string; phoneNumber: string };

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
    if (accessToken) await api.post("/api/v1/auth/logout");
  } catch {
    // Logging out locally must still work when the API is briefly unreachable.
  } finally {
    accessToken = null;
    currentUser = null;
  }
}

function setSession(session: AuthUser & { token: string }) {
  accessToken = session.token;
  currentUser = session;
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
  return unwrap<ClubMember[]>(await api.get(`/api/clubs/${id}/members`));
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
  if (axios.isAxiosError(error)) return error.response?.data?.message ?? error.message;
  return "Something went wrong. Please try again.";
}
