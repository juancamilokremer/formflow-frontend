import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserRole } from '../../models/user.model';
import { RouteConstants } from '../../constants/route.constants';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  if (!user) {
    return router.createUrlTree([`/${RouteConstants.LOGIN}`]);
  }

  const allowedRoles: UserRole[] = route.data?.['roles'] ?? [];
  if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
    return true;
  }
  return router.createUrlTree([`/${RouteConstants.DASHBOARD}`]);
};
