// pickelton-mobile/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://YOUR_LOCAL_IP:8080",
  timeout: 10000,
});

let accessToken: string | null = null;

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

function unwrap<T>(response: { data: { data: T } }) {
  return response.data.data;
}

export type LoginPayload = { email: string; password: string };
export type SignupPayload = { name: string; email: string; phoneNumber: string; dateOfBirth: string; password: string };
export type MatchPayload = { tournamentId: string; player1Id: string; player2Id: string; round: string };
export type HostPayload = {
  fullName: string; dateOfBirth: string; phoneNumber: string; addressLine1: string; city: string; stateRegion: string;
  postalCode: string; idDocumentType: "AADHAAR"; idDocumentNumberLast4: string; documentImageUrl: string;
  selfieWithDocumentUrl: string; termsAccepted: true; dataProcessingConsent: true;
};
export type ClubPayload = { name: string; location: string; description?: string };
export type Club = { id: string; name: string; location: string; description?: string; memberCount?: number };

export async function login(payload: LoginPayload) {
  const session = unwrap<{ token: string }>(await api.post("/api/v1/auth/login", payload));
  accessToken = session.token;
  return session;
}

export async function signup(payload: SignupPayload) {
  const session = unwrap<{ token: string }>(await api.post("/api/v1/auth/register", payload));
  accessToken = session.token;
  return session;
}

export async function createMatch(payload: MatchPayload) {
  return unwrap<{ id: string }>(await api.post("/api/matches", payload));
}

export async function applyHost(payload: HostPayload) {
  return unwrap(await api.post("/api/v1/host-verifications/me", payload));
}

export async function createClub(payload: ClubPayload) {
  return unwrap<Club>(await api.post("/api/clubs", payload));
}

export async function fetchCommunity() {
  const page = unwrap<{ content: Club[] }>(await api.get("/api/clubs"));
  return page.content;
}

export function apiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.message ?? error.message;
  return "Something went wrong. Please try again.";
}
