// packages/types/src/tournaments.ts
import type { ISODateTime, UUID } from "./common";
import type { SportType, TournamentStatus, TournamentType } from "./enums";
import type { PublicUserSummary } from "./users";

export type QuestionType = "TEXT" | "NUMBER" | "SELECT" | "CHECKBOX";

// A question the host adds to the registration form.
export type RegistrationQuestion = { id: string; label: string; type: QuestionType; required: boolean; options: string[] };

// A competition inside an event, e.g. "Men's doubles" or "Under-18 singles".
export type TournamentCategory = {
  id: UUID; name: string; format: TournamentType; maxPlayers: number; entryFee: number | null; registeredCount: number;
};
// id is set when editing an existing category.
export type CategoryRequest = { id?: UUID; name: string; format: TournamentType; maxPlayers: number; entryFee: number };

export type Tournament = {
  id: UUID; name: string; description: string | null; sportType: SportType; tournamentType: TournamentType;
  status: TournamentStatus; createdBy: PublicUserSummary; clubId: UUID | null; clubName: string | null;
  entryFee: number | null; maxPlayers: number;
  // Local date-times without a zone, e.g. "2026-11-07T09:00:00".
  startDate: string;
  venue: string | null;
  registrationDeadline: string | null;
  // Players pay the entry fee straight to this UPI ID.
  upiId: string | null;
  payeeName: string | null;
  paymentInstructions: string | null;
  registrationQuestions: RegistrationQuestion[];
  // Empty for a single-competition event. With categories, maxPlayers is their total and entryFee the lowest fee.
  categories: TournamentCategory[];
  registeredCount: number;
  createdAt: ISODateTime; updatedAt: ISODateTime;
};

export type CreateTournamentRequest = {
  name: string; description?: string; sportType: SportType; tournamentType: TournamentType;
  clubId?: UUID; entryFee: number; maxPlayers: number; startDate: string;
  venue?: string; registrationDeadline?: string; upiId?: string; payeeName?: string; paymentInstructions?: string;
  registrationQuestions?: RegistrationQuestion[];
  categories?: CategoryRequest[];
};

export type UpdateTournamentRequest = Partial<Omit<CreateTournamentRequest, "sportType" | "tournamentType" | "clubId">>;
