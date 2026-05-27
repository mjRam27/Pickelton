// pickelton-app/packages/types/src/users.ts
import type { ISODate, ISODateTime, UUID } from "./common";

export type UserStats = { userId: UUID; wins: number; losses: number; totalMatches: number };
export type PublicUserSummary = { id: UUID; name: string; avatarUrl: string | null; city: string | null };
export type PublicUserResponse = PublicUserSummary & { bio: string | null; stats: UserStats; createdAt: ISODateTime };
export type UserProfile = PublicUserSummary & {
  email: string;
  phoneNumber: string;
  dateOfBirth: ISODate;
  emailVerified: boolean;
  phoneVerified: boolean;
  bio: string | null;
  createdAt: ISODateTime;
};
export type UpdateUserRequest = { name?: string; phoneNumber?: string; bio?: string; avatarUrl?: string; city?: string };
