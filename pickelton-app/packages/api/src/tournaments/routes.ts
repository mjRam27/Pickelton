// pickelton-app/packages/api/src/tournaments/routes.ts
export const tournamentRoutes = {
  base: "/api/tournaments",
  mine: "/api/tournaments/me/hosted",
  byId: (id: string) => `/api/tournaments/${id}`,
  status: (id: string) => `/api/tournaments/${id}/status`,
  leaderboard: (id: string) => `/api/tournaments/${id}/leaderboard`,
  register: (id: string) => `/api/tournaments/${id}/register`,
  participants: (id: string) => `/api/tournaments/${id}/participants`,
} as const;
