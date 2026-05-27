// pickelton-app/packages/types/src/common.ts
export type ISODate = string;
export type ISODateTime = string;
export type UUID = string;

export type ApiResponse<T> = {
  success?: boolean;
  data: T;
  message?: string;
  timestamp?: ISODateTime;
};

export type ApiError = {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last?: boolean;
};
