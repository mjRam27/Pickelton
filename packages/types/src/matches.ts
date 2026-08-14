// pickelton-app/packages/types/src/matches.ts
import type { ISODateTime, UUID } from "./common";
import type { MatchStatus } from "./enums";

export type Match = { id: UUID; tournamentId: UUID; player1Id: UUID; player2Id: UUID; score1: number; score2: number; winnerId: UUID | null; round: string; status: MatchStatus; createdAt: ISODateTime; updatedAt: ISODateTime };
export type CreateMatchRequest = { tournamentId: UUID; player1Id: UUID; player2Id: UUID; round: string };
export type UpdateMatchScoreRequest = { score1: number; score2: number };
export type ScoreUpdatedEvent = { matchId: UUID; tournamentId: UUID; score1: number; score2: number; status: MatchStatus; winnerId: UUID | null };
