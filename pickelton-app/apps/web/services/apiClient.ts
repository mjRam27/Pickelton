// pickelton-app/apps/web/services/apiClient.ts
import { ApiClient } from "@pickelton/api";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const apiClient = new ApiClient(apiBaseUrl);
