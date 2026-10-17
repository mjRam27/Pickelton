// Per-sport scoring defaults. Scoring code reads these instead of hard-coding one sport's rules.
export type Ruleset = {
  pointsToWin: number;
  winBy: number;
  pointCap: number | null;
  scoring: "RALLY" | "SIDE_OUT";
  pointOptions: number[];
};

export const rulesets: Record<"PICKLEBALL" | "BADMINTON", Ruleset> = {
  PICKLEBALL: { pointsToWin: 11, winBy: 2, pointCap: null, scoring: "SIDE_OUT", pointOptions: [11, 15, 21] },
  BADMINTON: { pointsToWin: 21, winBy: 2, pointCap: 30, scoring: "RALLY", pointOptions: [15, 21, 30] },
};
