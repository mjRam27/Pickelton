// pickelton-app/packages/types/src/auth.ts
import type { ISODate, UUID } from "./common";

export type RegisterRequest = {
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: ISODate;
  password: string;
};

export type LoginRequest = { email: string; password: string };
export type GoogleLoginRequest = { idToken: string; phoneNumber?: string; dateOfBirth?: ISODate };
export type RefreshTokenRequest = { refreshToken: string };
export type LogoutRequest = { refreshToken?: string };
export type VerifyCodeRequest = { code: string };

export type AuthResponse = {
  token: string;
  refreshToken: string;
  accessTokenExpiresInMs: number;
  refreshTokenExpiresInMs: number;
  userId: UUID;
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: ISODate;
  emailVerified: boolean;
  phoneVerified: boolean;
};
