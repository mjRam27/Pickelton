import { api } from "./api";

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

export async function login(payload: LoginPayload) {
  const response = await api.post("/api/v1/auth/login", payload);
  const token = response.data?.data?.token;
  if (typeof window !== "undefined" && token) {
    window.localStorage.setItem("pickelton_token", token);
  }
  return response.data;
}

export async function signup(payload: SignupPayload) {
  const response = await api.post("/api/v1/auth/register", payload);
  const token = response.data?.data?.token;
  if (typeof window !== "undefined" && token) {
    window.localStorage.setItem("pickelton_token", token);
  }
  return response.data;
}
