import { User } from './user.model';

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

export interface LoginData {
  user: User;
  tokens: AuthTokens;
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}
