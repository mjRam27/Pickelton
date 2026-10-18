// packages/types/src/matches.ts
import type { ISODateTime, UUID } from "./common";
import type { InvitationStatus, MatchMode, MatchStatus, MatchType, ParticipantRole, SportType, TeamCode } from "./enums";

export type MatchRules = { pointsPerSet: number; bestOfSets: number; winByTwo: boolean };
export type MatchParticipantRequest = { userId: UUID; team: TeamCode | null; role: ParticipantRole };
export type CreateMatchRequest = {
  mode: MatchMode; tournamentId: UUID | null; categoryId?: UUID | null; player1Id: UUID; player2Id: UUID; participants: MatchParticipantRequest[];
  scorerId: UUID | null; refereeId: UUID | null; sport: Exclude<SportType, "BOTH">; matchType: MatchType;
  scheduledAt: ISODateTime | null; location: string | null; rules: MatchRules; round: string;
};

export type MatchParticipant = { id: UUID; userId: UUID; name: string; team: string | null; role: ParticipantRole; invitationStatus: InvitationStatus };

export type Match = {
  id: UUID; tournamentId: UUID | null; categoryId: UUID | null; player1Id: UUID | null; player2Id: UUID | null; score1: number | null; score2: number | null;
  winnerId: UUID | null; round: string | null; status: MatchStatus; sport: SportType; matchType: MatchType; location: string | null;
  scheduledAt: ISODateTime | null; rules: Record<string, unknown>; participants: MatchParticipant[];
  currentScore: Record<string, unknown>; currentSet: number | null; setSummary: Array<Record<string, unknown>>; revision: number | null;
};

export type LiveScore = {
  matchId: UUID; status: MatchStatus; currentScore: Record<string, unknown>; currentSet: number | null;
  setSummary: Array<Record<string, unknown>>; liveState: Record<string, unknown>; revision: number | null; updatedAt: ISODateTime | null;
};

export type MatchScorecard = {
  matchId: UUID; tournamentId: UUID | null; round: string | null; status: MatchStatus; venue: string | null; scheduledAt: ISODateTime | null;
  participants: MatchParticipant[]; scores: Record<string, number>; currentGameNumber: number; pointsToWin: number; bestOf: number;
  winByTwo: boolean; scorekeeperId: UUID | null; winnerId: UUID | null; revision: number; updatedAt: ISODateTime | null; createdAt: ISODateTime | null;
};
