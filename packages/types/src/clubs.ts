// packages/types/src/clubs.ts
import type { ISODateTime, UUID } from "./common";
import type { ClubRole } from "./enums";
import type { PublicUserSummary } from "./users";

export type Club = {
  id: UUID; name: string; description: string | null; location: string;
  latitude: number | null; longitude: number | null;
  // Only set when the list was requested with the caller's coordinates.
  distanceKm: number | null;
  createdBy: PublicUserSummary; memberCount: number; createdAt: ISODateTime; updatedAt: ISODateTime;
};
export type ClubMember = { id: UUID; clubId: UUID; user: PublicUserSummary; role: ClubRole; joinedAt: ISODateTime };
export type CreateClubRequest = { name: string; description?: string; location: string; latitude?: number; longitude?: number };
export type UpdateClubRequest = Partial<CreateClubRequest>;
export type ClubListQuery = { search?: string; latitude?: number; longitude?: number; page?: number; size?: number };
