import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = window.localStorage.getItem("pickelton_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
};

export function getApiMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string; errors?: Record<string, string> } | ApiEnvelope<unknown>>(error)) {
    const data = error.response?.data;
    if (data && "message" in data && data.message) return data.message;
    if (data && "errors" in data && data.errors) return Object.values(data.errors)[0] ?? fallback;
  }

  return fallback;
}
