// pickelton-app/packages/constants/src/sports.ts
import type { SportType } from "@pickelton/types";

export const sports: ReadonlyArray<{ value: SportType; label: string }> = [
  { value: "PICKLEBALL", label: "Pickleball" },
  { value: "BADMINTON", label: "Badminton" },
  { value: "BOTH", label: "Both" },
];
