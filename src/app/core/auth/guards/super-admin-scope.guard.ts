import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserRole } from '../../models/user.model';
import { RouteConstants } from '../../constants/route.constants';

/** SUPER_ADMIN is a Kode Labs platform account, not a real tenant — its internal
 *  "kodelabs" tenant has no forms/convocatorias/etc worth managing. Applied once on
 *  the shell's canActivateChild so every tenant-scoped route (most of which have no
 *  per-route roleGuard at all — Dashboard, Encuestas, Convocatorias, Categories,
 *  Billing, and every nested form-builder/preview/results path) is covered without
 *  having to annotate each one individually. /admin and /account stay reachable. */
export const superAdminScopeGuard: CanActivateChildFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    return true;
  }

  const allowedPaths: string[] = [RouteConstants.ADMIN, RouteConstants.ACCOUNT];
  if (allowedPaths.includes(route.routeConfig?.path ?? '')) {
    return true;
  }
  return router.createUrlTree([`/${RouteConstants.ADMIN}`]);
};
