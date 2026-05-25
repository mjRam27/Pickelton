import { api } from "./api";
import { clearSession, getStoredSessionUser, storeSession } from "./session";

export type AuthUser = {
  token?: string;
  refreshToken?: string;
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

export async function login(payload: LoginPayload) {
  const response = await api.post("/api/v1/auth/login", payload);
  const data = response.data?.data as AuthUser;
  storeSession({ token: data.token, refreshToken: data.refreshToken, user: data });
  return response.data;
}

export async function signup(payload: SignupPayload) {
  const response = await api.post("/api/v1/auth/register", payload);
  const data = response.data?.data as AuthUser;
  storeSession({ token: data.token, refreshToken: data.refreshToken, user: data });
  return response.data;
}

export async function googleLogin(payload: GoogleLoginPayload) {
  const response = await api.post("/api/v1/auth/google", payload);
  const data = response.data?.data as AuthUser;
  storeSession({ token: data.token, refreshToken: data.refreshToken, user: data });
  return response.data;
}

export async function logout() {
  try {
    await api.post("/api/v1/auth/logout");
  } finally {
    clearSession();
  }
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
  if (data) storeSession({ user: data });
  return response.data;
}

export function getStoredUser(): AuthUser | null {
  return getStoredSessionUser<AuthUser>();
}
