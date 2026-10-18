// packages/types/src/leaderboard.ts
import type { UUID } from "./common";
import type { TournamentType } from "./enums";

// One row: a singles player or a doubles pair. userId is the first player; name joins the pair's names.
export type LeaderboardEntry = {
  userId: UUID; name: string; players: Array<{ userId: UUID; name: string }>;
  played: number; won: number; lost: number; pointsFor: number; pointsAgainst: number; pointDiff: number; points: number;
};
export type CategoryLeaderboard = { categoryId: UUID; name: string; format: TournamentType; completedMatches: number; entries: LeaderboardEntry[] };
// entries ranks the whole event; categories has one table per category (empty when the event has none).
export type Leaderboard = { tournamentId: UUID; entries: LeaderboardEntry[]; categories: CategoryLeaderboard[] };
