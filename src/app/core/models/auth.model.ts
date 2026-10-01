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

export interface ForgotPasswordRequest {
  tenantSlug: string;
  email: string;
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

/** GET /public/invitations/{token} — shown before the accept-invite form. */
export interface InvitationPreview {
  tenantName: string;
  tenantSlug: string;
  email: string;
  role: string;
}

/** POST /public/invitations/{token}/accept — no tokens back, unlike register/login. */
export interface AcceptInvitationRequest {
  firstName: string;
  lastName: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}
