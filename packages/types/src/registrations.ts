// packages/types/src/registrations.ts
import type { ISODateTime, UUID } from "./common";
import type { RegistrationStatus } from "./enums";

export type PaymentStatus = "NOT_REQUIRED" | "AWAITING_PAYMENT" | "SUBMITTED" | "CONFIRMED" | "REJECTED";

// A player's own registration.
export type Registration = {
  id: UUID; userId: UUID; tournamentId: UUID; tournamentName: string; status: RegistrationStatus;
  answers: Record<string, string>; paymentStatus: PaymentStatus; amountDue: number | null;
  paymentReference: string | null; hostNote: string | null; createdAt: ISODateTime; updatedAt: ISODateTime;
};

// What the tournament host sees for each registration.
export type HostRegistration = {
  id: UUID; userId: UUID; name: string; email: string; phoneNumber: string; status: RegistrationStatus;
  answers: Record<string, string>; paymentStatus: PaymentStatus; amountDue: number | null; paymentReference: string | null;
  paymentSubmittedAt: ISODateTime | null; paymentReviewedAt: ISODateTime | null; hostNote: string | null; createdAt: ISODateTime;
};

export type TournamentParticipant = { registrationId: UUID; userId: UUID; name: string; status: RegistrationStatus };
export type TournamentRegisterRequest = { answers: Record<string, string> };
export type ReviewPaymentRequest = { status: "CONFIRMED" | "REJECTED"; note?: string };
