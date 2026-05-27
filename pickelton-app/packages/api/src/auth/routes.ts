// pickelton-app/packages/api/src/auth/routes.ts
export const authRoutes = {
  login: "/api/v1/auth/login",
  register: "/api/v1/auth/register",
  google: "/api/v1/auth/google",
  refresh: "/api/v1/auth/refresh",
  logout: "/api/v1/auth/logout",
  requestPhoneCode: "/api/v1/auth/verification-code",
  verifyPhoneCode: "/api/v1/auth/verify-code",
  me: "/api/v1/auth/me",
} as const;
