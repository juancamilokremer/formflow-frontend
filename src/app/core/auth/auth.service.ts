import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, catchError, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { RouteConstants } from '../constants/route.constants';
import { ApiResponse } from '../models/api-response.model';
import { User, UserRole } from '../models/user.model';
import { LoginRequest, RegisterRequest, AuthTokens, LoginData } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(request: LoginRequest): Observable<void> {
    return this.http
      .post<ApiResponse<LoginData>>(`${environment.apiUrl}/auth/login`, request, {
        headers: new HttpHeaders({ 'X-Tenant-ID': request.tenantSlug }),
      })
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.tokenService.setTokens(res.data.tokens, request.tenantSlug);
            this.currentUser.set(res.data.user);
          }
        }),
        map(() => void 0)
      );
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http
      .post<ApiResponse<LoginData>>(`${environment.apiUrl}/auth/register`, request)
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.tokenService.setTokens(res.data.tokens, request.slug);
            this.currentUser.set(res.data.user);
          }
        }),
        map(() => void 0)
      );
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
      .post<ApiResponse<AuthTokens>>(
        `${environment.apiUrl}/auth/refresh`,
        { refreshToken },
        { headers: new HttpHeaders({ 'X-Tenant-ID': tenantSlug }) }
      )
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.tokenService.setTokens(res.data, tenantSlug);
            this.setUserFromToken(res.data.accessToken);
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

  private setUserFromToken(accessToken: string): void {
    const payload = this.tokenService.decodeJwt(accessToken);
    if (payload) {
      this.currentUser.set({
        id: payload.sub,
        tenantId: payload.tenantId,
        email: payload.email,
        firstName: '',
        lastName: '',
        role: payload.role as UserRole,
        emailVerified: false,
      });
    }
  }
}
