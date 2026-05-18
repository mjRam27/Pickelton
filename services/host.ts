import { api } from "./api";

export type SubmitHostVerificationPayload = {
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateRegion?: string;
  postalCode: string;
  idDocumentType: string;
  idDocumentNumberLast4: string;
  documentImageUrl: string;
  selfieWithDocumentUrl: string;
  termsAccepted: boolean;
  dataProcessingConsent: boolean;
};

export async function submitHostVerification(payload: SubmitHostVerificationPayload) {
  const response = await api.post("/api/v1/host-verifications/me", payload);
  return response.data;
}
