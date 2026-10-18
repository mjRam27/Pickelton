// packages/types/src/auth.ts
import type { ISODate, ISODateTime, UUID } from "./common";

export type RegisterRequest = { name: string; email: string; phoneNumber: string; dateOfBirth: ISODate; password: string };
export type LoginRequest = { email: string; password: string };
export type RefreshTokenRequest = { refreshToken: string };
export type LogoutRequest = { refreshToken?: string };

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

export type MeResponse = {
  id: UUID; name: string; email: string; phoneNumber: string; dateOfBirth: ISODate;
  emailVerified: boolean; phoneVerified: boolean; createdAt: ISODateTime;
};
