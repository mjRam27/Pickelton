// pickelton-app/apps/mobile/src/types/matchFlow.ts
export type OfficialRole = "player" | "scorer" | "referee";
export type MatchStatus = "created" | "invited" | "accepted" | "live" | "completed";

export type LocalMatch = {
  players: string[];
  referee: string | null;
  scorer: string | null;
  role: OfficialRole;
  status: MatchStatus;
};
