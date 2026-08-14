// pickelton-app/packages/types/src/hostVerification.ts
import type { ISODate, ISODateTime, UUID } from "./common";
import type { HostVerificationStatus, IdDocumentType } from "./enums";

export type SubmitHostVerificationRequest = {
  fullName: string;
  dateOfBirth: ISODate;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateRegion?: string;
  postalCode: string;
  idDocumentType: IdDocumentType;
  idDocumentNumberLast4: string;
  documentImageUrl: string;
  selfieWithDocumentUrl: string;
  termsAccepted: boolean;
  dataProcessingConsent: boolean;
};

export type HostVerification = SubmitHostVerificationRequest & {
  id: UUID;
  userId: UUID;
  status: HostVerificationStatus;
  submittedAt: ISODateTime;
  reviewedAt: ISODateTime | null;
  rejectionReason: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
