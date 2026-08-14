// pickelton-app/packages/types/src/registrations.ts
import type { ISODateTime, UUID } from "./common";
import type { RegistrationStatus } from "./enums";

export type Registration = { id: UUID; userId: UUID; tournamentId: UUID; status: RegistrationStatus; createdAt: ISODateTime; updatedAt: ISODateTime };
export type TournamentParticipant = { registrationId: UUID; userId: UUID; name: string; status: RegistrationStatus };
