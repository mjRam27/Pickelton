// pickelton-app/packages/types/src/leaderboard.ts
import type { UUID } from "./common";

export type LeaderboardEntry = { rank: number; userId: UUID; name: string; wins: number; losses: number; points: number };
export type Leaderboard = { tournamentId: UUID; entries: LeaderboardEntry[] };
