// pickelton-app/packages/api/src/users/routes.ts
export const userRoutes = {
  me: "/api/v1/users/me",
  byId: (id: string) => `/api/v1/users/${id}`,
  stats: (id: string) => `/api/v1/users/${id}/stats`,
} as const;
