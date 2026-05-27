// pickelton-app/packages/types/src/tournaments.ts
import type { ISODateTime, UUID } from "./common";
import type { SportType, TournamentStatus, TournamentType } from "./enums";
import type { PublicUserSummary } from "./users";

export type Tournament = { id: UUID; name: string; description: string; sportType: SportType; tournamentType: TournamentType; status: TournamentStatus; createdBy: PublicUserSummary; clubId: UUID | null; clubName: string | null; entryFee: number; maxPlayers: number; startDate: ISODateTime; createdAt: ISODateTime; updatedAt: ISODateTime };
export type CreateTournamentRequest = { name: string; description?: string; sportType: SportType; tournamentType: TournamentType; clubId?: UUID; entryFee: number; maxPlayers: number; startDate: ISODateTime };
export type UpdateTournamentRequest = Partial<Omit<CreateTournamentRequest, "sportType" | "tournamentType" | "clubId">>;
export type UpdateTournamentStatusRequest = { status: TournamentStatus };
