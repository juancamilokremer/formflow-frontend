import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, catchError, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { RouteConstants } from '../constants/route.constants';
import { ApiResponse } from '../models/api-response.model';
import { User, UserRole } from '../models/user.model';
import {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  AuthResponse,
  AuthUserSummary,
  AuthTenantSummary,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(request: LoginRequest): Observable<void> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, request, {
        headers: new HttpHeaders({ 'X-Tenant-ID': request.tenantSlug }),
      })
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.applyAuthResponse(res.data, request.tenantSlug);
          }
        }),
        map(() => void 0)
      );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post<ApiResponse<RegisterResponse>>(`${environment.apiUrl}/auth/register`, request)
      .pipe(map((res) => res.data!));
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${environment.apiUrl}/auth/forgot-password`, request, {
        headers: new HttpHeaders({ 'X-Tenant-ID': request.tenantSlug }),
      })
      .pipe(map(() => void 0));
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${environment.apiUrl}/auth/reset-password`, { token, newPassword })
      .pipe(map(() => void 0));
  }

  verifyEmail(token: string): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${environment.apiUrl}/auth/verify-email`, { token })
      .pipe(map(() => void 0));
  }

  resendVerification(): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${environment.apiUrl}/auth/resend-verification`, {})
      .pipe(map(() => void 0));
  }

  markEmailVerified(): void {
    const user = this.currentUser();
    if (user) {
      this.currentUser.set({ ...user, emailVerified: true });
    }
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.currentUser.set(null);
    this.router.navigate([`/${RouteConstants.LOGIN}`]);
  }

  refreshToken(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();
    const tenantSlug = this.tokenService.getTenantSlug();
    if (!refreshToken || !tenantSlug) {
      return of(void 0);
    }
    return this.http
      .post<ApiResponse<AuthResponse>>(
        `${environment.apiUrl}/auth/refresh`,
        { refreshToken },
        { headers: new HttpHeaders({ 'X-Tenant-ID': tenantSlug }) }
      )
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.applyAuthResponse(res.data, tenantSlug);
          }
        }),
        map(() => void 0)
      );
  }

  initialize(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return of(void 0);
    }
    return this.refreshToken().pipe(
      catchError(() => {
        this.tokenService.clearTokens();
        return of(void 0);
      })
    );
  }

  private applyAuthResponse(data: AuthResponse, tenantSlug: string): void {
    this.tokenService.setTokens(
      { accessToken: data.accessToken, refreshToken: data.refreshToken },
      tenantSlug
    );
    this.currentUser.set(this.mapUser(data.user, data.tenant));
  }

  private mapUser(user: AuthUserSummary, tenant: AuthTenantSummary): User {
    const parts = user.fullName.trim().split(/\s+/);
    return {
      id: user.id,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantPlan: tenant.plan,
      email: user.email,
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' '),
      role: user.role as UserRole,
      emailVerified: user.emailVerified,
    };
  }
}
