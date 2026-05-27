// pickelton-app/packages/api/src/registrations/routes.ts
export const registrationRoutes = {
  mine: "/api/registrations/me",
  cancel: (id: string) => `/api/registrations/${id}/cancel`,
} as const;
