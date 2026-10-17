// pickelton-app/packages/api/src/partnerApi.ts
import type {
  ApiResponse,
  Booking,
  BookingStatus,
  Court,
  CourtRequest,
  PageResponse,
  Partner,
  PartnerCustomer,
  PartnerDashboard,
  PartnerLoginResponse,
  PartnerReport,
  PartnerSettings,
  UpdatePartnerProfileRequest,
} from "@pickelton/types";
import { ApiClient, type AccessTokenProvider } from "./client";

function body(method: string, payload: unknown): RequestInit {
  return { method, body: JSON.stringify(payload) };
}

function query(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "") search.set(key, String(value));
  const text = search.toString();
  return text ? `?${text}` : "";
}

// Client for partner-backend. baseUrl already includes /api/v1.
export function createPartnerApi(baseUrl: string, getAccessToken?: AccessTokenProvider) {
  const client = new ApiClient(baseUrl, getAccessToken);
  const get = async <T>(path: string) => (await client.request<ApiResponse<T>>(path)).data;
  const send = async <T>(method: string, path: string, payload?: unknown) =>
    (await client.request<ApiResponse<T>>(path, payload === undefined ? { method } : body(method, payload))).data;

  return {
    auth: {
      login: (email: string, password: string) => send<PartnerLoginResponse>("POST", "/auth/login", { email, password }),
      me: () => get<Partner>("/auth/me"),
    },
    dashboard: () => get<PartnerDashboard>("/dashboard"),
    courts: {
      list: (params: { search?: string; page?: number; size?: number } = {}) => get<PageResponse<Court>>(`/courts${query(params)}`),
      create: (request: CourtRequest) => send<Court>("POST", "/courts", request),
      update: (id: string, request: Partial<CourtRequest>) => send<Court>("PATCH", `/courts/${id}`, request),
    },
    bookings: {
      list: (params: { status?: BookingStatus; search?: string; page?: number; size?: number } = {}) => get<PageResponse<Booking>>(`/bookings${query(params)}`),
      get: (id: string) => get<Booking>(`/bookings/${id}`),
      setStatus: (id: string, status: BookingStatus) => send<Booking>("PATCH", `/bookings/${id}/status`, { status }),
    },
    customers: {
      list: (params: { search?: string; page?: number; size?: number } = {}) => get<PageResponse<PartnerCustomer>>(`/customers${query(params)}`),
    },
    reports: {
      summary: (from: string, to: string) => get<PartnerReport>(`/reports/summary${query({ from, to })}`),
    },
    profile: {
      get: () => get<Partner>("/profile"),
      update: (request: UpdatePartnerProfileRequest) => send<Partner>("PATCH", "/profile", request),
    },
    settings: {
      get: () => get<PartnerSettings>("/settings"),
      save: (settings: PartnerSettings) => send<PartnerSettings>("PUT", "/settings", settings),
    },
  };
}

export type PartnerApi = ReturnType<typeof createPartnerApi>;
