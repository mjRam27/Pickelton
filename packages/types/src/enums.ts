// packages/types/src/enums.ts. Mirrors the Java backend enums (com.pickelton.backend.enums).
export type ClubRole = "ADMIN" | "MEMBER";
export type HostVerificationStatus = "NOT_SUBMITTED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "EXPIRED";
export type IdDocumentType = "AADHAAR" | "PAN" | "VOTER_ID" | "PASSPORT" | "DRIVING_LICENSE";
export type MatchStatus = "CREATED" | "INVITED" | "ACCEPTED" | "SCHEDULED" | "IN_PROGRESS" | "LIVE" | "COMPLETED" | "CANCELLED";
export type MatchMode = "CASUAL" | "TOURNAMENT";
export type MatchType = "SINGLES" | "DOUBLES" | "TEAM";
export type ParticipantRole = "PLAYER" | "SCORER" | "REFEREE";
export type InvitationStatus = "INVITED" | "ACCEPTED" | "DECLINED";
export type RegistrationStatus = "REGISTERED" | "CANCELLED";
export type SportType = "PICKLEBALL" | "BADMINTON" | "BOTH";
export type TournamentStatus = "UPCOMING" | "ONGOING" | "FINISHED" | "CANCELLED";
export type TournamentType = "SINGLES" | "DOUBLES";
export type TeamCode = "A" | "B";
