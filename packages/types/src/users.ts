// packages/types/src/users.ts
import type { ISODate, ISODateTime, UUID } from "./common";

export type PublicUserSummary = { id: UUID; name: string; avatarUrl: string | null; city: string | null };
export type UserStats = { userId: UUID; wins: number; losses: number; totalMatches: number };

export type User = {
  id: UUID; name: string; email: string; phoneNumber: string; dateOfBirth: ISODate;
  emailVerified: boolean; phoneVerified: boolean; bio: string | null; avatarUrl: string | null; city: string | null;
  createdAt: ISODateTime;
};
export type UpdateUserRequest = Partial<{ name: string; bio: string | null; avatarUrl: string | null; city: string | null }>;

export type PublicUser = { id: UUID; name: string; bio: string | null; avatarUrl: string | null; city: string | null; stats: UserStats; createdAt: ISODateTime };
export type UserSearchResult = { userId: UUID; name: string; email: string; phoneNumber: string };

export type SuggestionReason = "RECENT_PLAYER" | "NEARBY" | "COMMUNITY";
export type PlayerSuggestion = {
  userId: UUID; name: string; avatarUrl: string | null; city: string | null;
  lastPlayedAt: ISODateTime | null; following: boolean; reason: SuggestionReason;
};
export type FollowResponse = { following: boolean };
