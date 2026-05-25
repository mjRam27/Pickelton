import axios from "axios";
import { clearSession, getAccessToken, getRefreshToken, storeSession } from "./session";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = getRefreshToken();

    if (
      error.response?.status !== 401 ||
      !refreshToken ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/api/v1/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await axios.post(`${api.defaults.baseURL}/api/v1/auth/refresh`, { refreshToken });
      const data = response.data?.data;
      storeSession({ token: data?.token, refreshToken: data?.refreshToken, user: data });
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${data.token}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  }
);

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
};

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string> | Array<{ field?: string; message?: string }>;
};

export function getApiMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorBody | ApiEnvelope<unknown>>(error)) {
    const data = error.response?.data;
    if (data && "message" in data && data.message) return data.message;
    if (data && "errors" in data && data.errors) {
      if (Array.isArray(data.errors)) {
        return data.errors.find((fieldError) => fieldError.message)?.message ?? fallback;
      }
      return Object.values(data.errors)[0] ?? fallback;
    }
  }

  return fallback;
}
