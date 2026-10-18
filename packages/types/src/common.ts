// packages/types/src/common.ts
export type ISODate = string;
export type ISODateTime = string;
export type UUID = string;

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  timestamp?: ISODateTime;
};

// Thrown by the shared ApiClient. status is the HTTP status, or 0 when the server could not be reached.
export type ApiError = {
  message: string;
  status?: number;
  errors?: Array<{ field: string; message: string }> | null;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};
