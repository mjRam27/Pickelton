// pickelton-app/packages/api/src/index.ts
export * from "./client";
export * from "./pickeltonApi";
export type {
  AuthResponse,
  Club,
  CreateClubRequest,
  CreateMatchRequest,
  CreateTournamentRequest,
  HostVerification,
  LoginRequest,
  Match,
  RegisterRequest,
  SubmitHostVerificationRequest,
  Tournament,
  VerifyCodeRequest,
} from "@pickelton/types";
export { authRoutes } from "./auth/routes";
export { userRoutes } from "./users/routes";
export { clubRoutes } from "./clubs/routes";
export { tournamentRoutes } from "./tournaments/routes";
export { matchRoutes } from "./matches/routes";
export { registrationRoutes } from "./registrations/routes";
export { hostVerificationRoutes } from "./hostVerification/routes";
