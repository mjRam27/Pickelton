// pickelton-app/packages/types/src/clubs.ts
import type { ISODateTime, UUID } from "./common";
import type { ClubRole } from "./enums";
import type { PublicUserSummary } from "./users";

export type Club = { id: UUID; name: string; description: string; location: string; createdBy: PublicUserSummary; memberCount: number; createdAt: ISODateTime; updatedAt: ISODateTime };
export type ClubMember = { id: UUID; clubId: UUID; user: PublicUserSummary; role: ClubRole; joinedAt: ISODateTime };
export type CreateClubRequest = { name: string; description?: string; location: string };
export type UpdateClubRequest = Partial<CreateClubRequest>;
export type UpdateClubMemberRoleRequest = { role: ClubRole };
