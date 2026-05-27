// pickelton-app/packages/api/src/pickeltonApi.ts
import type {
  ApiResponse,
  AuthResponse,
  Club,
  CreateClubRequest,
  CreateMatchRequest,
  CreateTournamentRequest,
  HostVerification,
  LoginRequest,
  Match,
  PageResponse,
  RegisterRequest,
  SubmitHostVerificationRequest,
  Tournament,
  VerifyCodeRequest,
} from "@pickelton/types";
import { authRoutes } from "./auth/routes";
import { clubRoutes } from "./clubs/routes";
import { ApiClient, type AccessTokenProvider } from "./client";
import { hostVerificationRoutes } from "./hostVerification/routes";
import { matchRoutes } from "./matches/routes";
import { tournamentRoutes } from "./tournaments/routes";

function jsonBody(body: unknown): RequestInit {
  return { method: "POST", body: JSON.stringify(body) };
}

export function createPickeltonApi(baseUrl: string, getAccessToken?: AccessTokenProvider) {
  const client = new ApiClient(baseUrl, getAccessToken);

  return {
    auth: {
      async login(request: LoginRequest) {
        return (await client.request<ApiResponse<AuthResponse>>(authRoutes.login, jsonBody(request))).data;
      },
      async register(request: RegisterRequest) {
        return (await client.request<ApiResponse<AuthResponse>>(authRoutes.register, jsonBody(request))).data;
      },
      async requestPhoneCode() {
        return client.request<ApiResponse<null>>(authRoutes.requestPhoneCode, { method: "POST" });
      },
      async verifyPhoneCode(request: VerifyCodeRequest) {
        return client.request<ApiResponse<null>>(authRoutes.verifyPhoneCode, jsonBody(request));
      },
    },
    clubs: {
      async list() {
        return (await client.request<ApiResponse<PageResponse<Club>>>(clubRoutes.base)).data.content;
      },
      async create(request: CreateClubRequest) {
        return (await client.request<ApiResponse<Club>>(clubRoutes.base, jsonBody(request))).data;
      },
    },
    hostVerification: {
      async submit(request: SubmitHostVerificationRequest) {
        return (await client.request<ApiResponse<HostVerification>>(hostVerificationRoutes.submit, jsonBody(request))).data;
      },
    },
    tournaments: {
      async create(request: CreateTournamentRequest) {
        return (await client.request<ApiResponse<Tournament>>(tournamentRoutes.base, jsonBody(request))).data;
      },
    },
    matches: {
      async create(request: CreateMatchRequest) {
        return (await client.request<ApiResponse<Match>>(matchRoutes.base, jsonBody(request))).data;
      },
    },
  };
}

export type PickeltonApi = ReturnType<typeof createPickeltonApi>;
