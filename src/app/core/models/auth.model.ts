export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface RegisterRequest {
  companyName: string;
  slug: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Exact shape of ApiResponse<data> returned by /auth/login, /auth/register, /auth/refresh */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  user: AuthUserSummary;
  tenant: AuthTenantSummary;
}

export interface AuthUserSummary {
  id: string;
  email: string;
  fullName: string;
  role: string;
  emailVerified: boolean;
}

export interface AuthTenantSummary {
  id: string;
  slug: string;
  name: string;
  plan: string;
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}
