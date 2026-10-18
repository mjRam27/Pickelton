// packages/api/src/client.ts
import type { ApiError } from "@pickelton/types";

export type AccessTokenProvider = () => string | null | Promise<string | null>;

export type ClientOptions = {
  getAccessToken?: AccessTokenProvider;
  // Called once when a request gets 401. Return true if a new access token is now available.
  refreshAccessToken?: () => Promise<boolean>;
};

const UNREACHABLE = "Can't reach Pickelton right now. Check your connection and try again.";

export class ApiClient {
  private readonly options: ClientOptions;

  constructor(private readonly baseUrl: string, options: ClientOptions | AccessTokenProvider = {}) {
    this.options = typeof options === "function" ? { getAccessToken: options } : options;
  }

  async request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
    const token = await this.options.getAccessToken?.();
    const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: {
          ...(isForm ? {} : { "Content-Type": "application/json" }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init.headers,
        },
      });
    } catch {
      throw { message: UNREACHABLE, status: 0 } satisfies ApiError;
    }

    if (response.status === 401 && !retried && this.options.refreshAccessToken && (await this.options.refreshAccessToken())) {
      return this.request<T>(path, init, true);
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string; error?: { message?: string }; errors?: ApiError["errors"] } | null;
      const message = body?.message ?? body?.error?.message ?? (response.status >= 500 ? "Something went wrong on our side. Please try again." : "Request failed");
      throw { message, status: response.status, errors: body?.errors ?? null } satisfies ApiError;
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
}

export function apiErrorMessage(error: unknown): string {
  const apiError = error as Partial<ApiError> | undefined;
  const fieldMessage = apiError?.errors?.[0]?.message;
  return fieldMessage ?? apiError?.message ?? "Something went wrong. Please try again.";
}
