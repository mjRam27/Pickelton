// pickelton-app/packages/api/src/matches/routes.ts
export const matchRoutes = {
  base: "/api/matches",
  byId: (id: string) => `/api/matches/${id}`,
  score: (id: string) => `/api/matches/${id}/score`,
  cancel: (id: string) => `/api/matches/${id}/cancel`,
  tournament: (id: string) => `/api/matches/tournament/${id}`,
} as const;
