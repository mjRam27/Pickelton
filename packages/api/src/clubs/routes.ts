// pickelton-app/packages/api/src/clubs/routes.ts
export const clubRoutes = {
  base: "/api/clubs",
  mine: "/api/clubs/me",
  byId: (id: string) => `/api/clubs/${id}`,
  join: (id: string) => `/api/clubs/${id}/join`,
  leave: (id: string) => `/api/clubs/${id}/leave`,
  members: (id: string) => `/api/clubs/${id}/members`,
} as const;
