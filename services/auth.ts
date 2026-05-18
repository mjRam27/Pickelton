import { api } from "./api";

export type AuthUser = {
  token?: string;
  userId?: string;
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  password: string;
};

export type GoogleLoginPayload = {
  idToken: string;
  phoneNumber?: string;
  dateOfBirth?: string;
};

function storeSession(data: AuthUser) {
  if (typeof window === "undefined") return;
  if (data.token) window.localStorage.setItem("pickelton_token", data.token);
  window.localStorage.setItem("pickelton_user", JSON.stringify(data));
}

export async function login(payload: LoginPayload) {
  const response = await api.post("/api/v1/auth/login", payload);
  const data = response.data?.data as AuthUser;
  storeSession(data);
  return response.data;
}

export async function signup(payload: SignupPayload) {
  const response = await api.post("/api/v1/auth/register", payload);
  const data = response.data?.data as AuthUser;
  storeSession(data);
  return response.data;
}

export async function googleLogin(payload: GoogleLoginPayload) {
  const response = await api.post("/api/v1/auth/google", payload);
  const data = response.data?.data as AuthUser;
  storeSession(data);
  return response.data;
}

export async function requestPhoneOtp() {
  const response = await api.post("/api/v1/auth/verification-code");
  return response.data;
}

export async function verifyPhoneOtp(code: string) {
  const response = await api.post("/api/v1/auth/verify-code", { code });
  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/v1/auth/me");
  const data = response.data?.data as AuthUser;
  if (typeof window !== "undefined" && data) {
    window.localStorage.setItem("pickelton_user", JSON.stringify(data));
  }
  return response.data;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("pickelton_user");
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}
