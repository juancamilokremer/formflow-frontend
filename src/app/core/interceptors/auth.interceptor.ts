import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../auth/token.service';
import { AuthService } from '../auth/auth.service';
import { RouteConstants } from '../constants/route.constants';

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email', '/auth/resend-verification', '/auth/refresh'];

function isAuthPath(url: string): boolean {
  return AUTH_PATHS.some((p) => url.includes(p));
}

function addCredentials(req: HttpRequest<unknown>, token: string | null, tenantSlug: string | null): HttpRequest<unknown> {
  let headers = req.headers;
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  if (tenantSlug && !headers.has('X-Tenant-ID')) {
    headers = headers.set('X-Tenant-ID', tenantSlug);
  }
  return req.clone({ headers });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const outReq = addCredentials(req, tokenService.getAccessToken(), tokenService.getTenantSlug());

  return next(outReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthPath(req.url)) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const retryReq = addCredentials(req, tokenService.getAccessToken(), tokenService.getTenantSlug());
            return next(retryReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            router.navigate([`/${RouteConstants.LOGIN}`]);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
