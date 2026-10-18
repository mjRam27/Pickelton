// packages/types/src/tournaments.ts
import type { ISODateTime, UUID } from "./common";
import type { SportType, TournamentStatus, TournamentType } from "./enums";
import type { PublicUserSummary } from "./users";

export type Tournament = {
  id: UUID; name: string; description: string | null; sportType: SportType; tournamentType: TournamentType;
  status: TournamentStatus; createdBy: PublicUserSummary; clubId: UUID | null; clubName: string | null;
  entryFee: number | null; maxPlayers: number;
  // Local date-time without a zone, e.g. "2026-11-07T09:00:00".
  startDate: string;
  createdAt: ISODateTime; updatedAt: ISODateTime;
};
export type CreateTournamentRequest = {
  name: string; description?: string; sportType: SportType; tournamentType: TournamentType;
  clubId?: UUID; entryFee: number; maxPlayers: number; startDate: string;
};
