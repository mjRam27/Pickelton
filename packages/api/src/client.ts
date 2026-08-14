// pickelton-app/packages/api/src/client.ts
import type { ApiError } from "@pickelton/types";

export type AccessTokenProvider = () => string | null | Promise<string | null>;

export class ApiClient {
  constructor(private readonly baseUrl: string, private readonly getAccessToken?: AccessTokenProvider) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.getAccessToken?.();
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({ message: "Request failed" }))) as ApiError;
      throw error;
    }

    return response.json() as Promise<T>;
  }
}
