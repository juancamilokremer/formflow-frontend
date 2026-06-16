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

/** Response of POST /auth/register — no tokens, the admin must confirm their email first. */
export interface RegisterResponse {
  user: AuthUserSummary;
  tenant: AuthTenantSummary;
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}
