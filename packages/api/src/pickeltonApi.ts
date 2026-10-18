// packages/api/src/pickeltonApi.ts
// One client for the Java backend, shared by the website and (eventually) the mobile app.
import type {
  ApiResponse,
  AuthResponse,
  Club,
  ClubListQuery,
  ClubMember,
  ClubRole,
  CommunityPost,
  CreateClubRequest,
  CreateMatchRequest,
  CreatePostRequest,
  CreateTournamentRequest,
  FollowResponse,
  HostRegistration,
  HostVerification,
  KycUpload,
  Leaderboard,
  LiveScore,
  LoginRequest,
  Match,
  MatchScorecard,
  MeResponse,
  PageResponse,
  PlayerSuggestion,
  RegisterRequest,
  Registration,
  ReviewPaymentRequest,
  TournamentRegisterRequest,
  SubmitHostVerificationRequest,
  TeamCode,
  Tournament,
  TournamentParticipant,
  UpdateTournamentRequest,
  UpdateUserRequest,
  User,
  UserSearchResult,
  UserStats,
} from "@pickelton/types";
import { ApiClient } from "./client";

// Where the app keeps its tokens: localStorage on the web, secure storage on phones.
export type SessionHandlers = {
  getAccessToken: () => string | null | Promise<string | null>;
  getRefreshToken: () => string | null | Promise<string | null>;
  onTokensRefreshed: (auth: AuthResponse) => void | Promise<void>;
  onSessionExpired: () => void | Promise<void>;
};

// A file picked in the browser (Blob/File) or on a phone ({ uri, name, type }).
export type UploadFile = Blob | { uri: string; name: string; type: string };

function query(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  const text = search.toString();
  return text ? `?${text}` : "";
}

export function createPickeltonApi(baseUrl: string, session?: SessionHandlers) {
  let refreshing: Promise<boolean> | null = null;

  // Single-flight refresh so parallel 401s trigger only one /refresh call.
  async function refreshAccessToken() {
    if (!session) return false;
    refreshing ??= (async () => {
      const refreshToken = await session.getRefreshToken();
      if (!refreshToken) {
        await session.onSessionExpired();
        return false;
      }
      try {
        const auth = (await new ApiClient(baseUrl).request<ApiResponse<AuthResponse>>("/api/v1/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) })).data;
        await session.onTokensRefreshed(auth);
        return true;
      } catch {
        await session.onSessionExpired();
        return false;
      } finally {
        refreshing = null;
      }
    })();
    return refreshing;
  }

  const client = new ApiClient(baseUrl, { getAccessToken: session?.getAccessToken, refreshAccessToken: session ? refreshAccessToken : undefined });
  const get = async <T>(path: string) => (await client.request<ApiResponse<T>>(path)).data;
  const send = async <T>(method: string, path: string, body?: unknown) =>
    (await client.request<ApiResponse<T>>(path, { method, body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body) })).data;

  return {
    auth: {
      login: (request: LoginRequest) => send<AuthResponse>("POST", "/api/v1/auth/login", request),
      register: (request: RegisterRequest) => send<AuthResponse>("POST", "/api/v1/auth/register", request),
      logout: (refreshToken?: string) => send<void>("POST", "/api/v1/auth/logout", { refreshToken }),
      me: () => get<MeResponse>("/api/v1/auth/me"),
      // Sends an SMS code to the user's phone; verifyPhoneCode marks the phone verified.
      sendPhoneCode: () => send<void>("POST", "/api/v1/auth/verification-code"),
      verifyPhoneCode: (code: string) => send<void>("POST", "/api/v1/auth/verify-code", { code }),
    },
    users: {
      me: () => get<User>("/api/v1/users/me"),
      updateMe: (request: UpdateUserRequest) => send<User>("PUT", "/api/v1/users/me", request),
      search: (text: string, limit = 10) => get<UserSearchResult[]>(`/api/v1/users/search${query({ query: text, limit })}`),
      suggestions: (limit = 8) => get<PlayerSuggestion[]>(`/api/v1/users/suggestions${query({ limit })}`),
      follow: (userId: string) => send<FollowResponse>("POST", `/api/v1/users/${userId}/follow`),
      unfollow: (userId: string) => send<FollowResponse>("DELETE", `/api/v1/users/${userId}/follow`),
      stats: (userId: string) => get<UserStats>(`/api/v1/users/${userId}/stats`),
    },
    clubs: {
      list: (params: ClubListQuery = {}) => get<PageResponse<Club>>(`/api/clubs${query(params)}`),
      mine: () => get<Club[]>("/api/clubs/me"),
      get: (id: string) => get<Club>(`/api/clubs/${id}`),
      create: (request: CreateClubRequest) => send<Club>("POST", "/api/clubs", request),
      join: (id: string) => send<ClubMember>("POST", `/api/clubs/${id}/join`),
      leave: (id: string) => send<void>("DELETE", `/api/clubs/${id}/leave`),
      members: (id: string) => get<ClubMember[]>(`/api/clubs/${id}/members`),
      setRole: (id: string, userId: string, role: ClubRole) => send<ClubMember>("PATCH", `/api/clubs/${id}/members/${userId}/role`, { role }),
    },
    community: {
      list: (page = 0, size = 20) => get<PageResponse<CommunityPost>>(`/api/community/posts${query({ page, size })}`),
      create: (request: CreatePostRequest) => send<CommunityPost>("POST", "/api/community/posts", request),
      remove: (id: string) => send<void>("DELETE", `/api/community/posts/${id}`),
    },
    tournaments: {
      list: (params: { page?: number; size?: number } = {}) => get<PageResponse<Tournament>>(`/api/tournaments${query(params)}`),
      hosted: () => get<Tournament[]>("/api/tournaments/me/hosted"),
      get: (id: string) => get<Tournament>(`/api/tournaments/${id}`),
      create: (request: CreateTournamentRequest) => send<Tournament>("POST", "/api/tournaments", request),
      update: (id: string, request: UpdateTournamentRequest) => send<Tournament>("PATCH", `/api/tournaments/${id}`, request),
      register: (id: string, answers: Record<string, string> = {}, categoryIds?: string[]) =>
        send<Registration>("POST", `/api/tournaments/${id}/register`, { answers, categoryIds } satisfies TournamentRegisterRequest),
      // The signed-in player's registration for this tournament; null when not registered.
      myRegistration: async (id: string) => (await get<Registration | null | undefined>(`/api/tournaments/${id}/registration`)) ?? null,
      myRegistrations: () => get<Registration[]>("/api/tournaments/registrations/me"),
      submitPayment: (id: string, reference: string) => send<Registration>("POST", `/api/tournaments/${id}/registration/payment`, { reference }),
      // Host only.
      registrations: (id: string) => get<HostRegistration[]>(`/api/tournaments/${id}/registrations`),
      removePlayer: (id: string, userId: string) => send<Registration>("DELETE", `/api/tournaments/${id}/participants/${userId}`),
      reviewPayment: (id: string, registrationId: string, request: ReviewPaymentRequest) =>
        send<HostRegistration>("PATCH", `/api/tournaments/${id}/registrations/${registrationId}/payment`, request),
      cancelRegistration: (id: string) => send<void>("DELETE", `/api/tournaments/${id}/register`),
      participants: (id: string) => get<TournamentParticipant[]>(`/api/tournaments/${id}/participants`),
      leaderboard: (id: string) => get<Leaderboard>(`/api/tournaments/${id}/leaderboard`),
    },
    matches: {
      create: (request: CreateMatchRequest) => send<Match>("POST", "/api/matches", request),
      liveScore: (id: string) => get<LiveScore>(`/api/matches/${id}/live-score`),
      addPoint: (id: string, teamCode: TeamCode) => send<MatchScorecard>("POST", `/api/matches/${id}/scorecard/point`, { teamCode }),
      undo: (id: string) => send<MatchScorecard>("POST", `/api/matches/${id}/scorecard/undo`),
      complete: (id: string) => send<MatchScorecard>("POST", `/api/matches/${id}/scorecard/complete`),
      forTournament: (tournamentId: string) => get<Match[]>(`/api/matches/tournament/${tournamentId}`),
      // Host enters a final score without live scoring; this completes the match.
      enterResult: (id: string, scoreA: number, scoreB: number, reason = "Result entered by host") =>
        send<MatchScorecard>("POST", `/api/matches/${id}/scorecard/correction`, { scoreA, scoreB, reason }),
      cancel: (id: string) => send<Match>("PATCH", `/api/matches/${id}/cancel`),
    },
    host: {
      mine: () => get<HostVerification | null>("/api/v1/host-verifications/me"),
      submit: (request: SubmitHostVerificationRequest) => send<HostVerification>("POST", "/api/v1/host-verifications/me", request),
      upload: (file: UploadFile, name = "document") => {
        const form = new FormData();
        form.append("file", file as Blob, "name" in file ? file.name : name);
        return send<KycUpload>("POST", "/api/v1/host-verifications/uploads", form);
      },
    },
  };
}

export type PickeltonApi = ReturnType<typeof createPickeltonApi>;
