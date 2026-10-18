// packages/types/src/leaderboard.ts
import type { UUID } from "./common";

export type LeaderboardEntry = { userId: UUID; name: string; played: number; won: number; lost: number; points: number };
export type Leaderboard = { tournamentId: UUID; entries: LeaderboardEntry[] };
