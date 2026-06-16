import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../auth.service';
import { signal } from '@angular/core';
import { UserRole } from '../../models/user.model';

const adminUser = { id: '1', tenantId: 't1', email: 'a@b.com', firstName: '', lastName: '', role: UserRole.TENANT_ADMIN, emailVerified: true };

function runGuard(roles: UserRole[], user = adminUser) {
  const route = { data: { roles } } as unknown as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() =>
    roleGuard(route, {} as RouterStateSnapshot)
  );
}

describe('roleGuard', () => {
  let authService: Partial<AuthService>;

  beforeEach(() => {
    authService = { currentUser: signal(null) as AuthService['currentUser'] };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    });
  });

  it('redirects to login when no user', () => {
    const result = runGuard([UserRole.TENANT_ADMIN]);
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.createUrlTree(['/login']));
  });

  it('allows access when user has required role', () => {
    (authService as { currentUser: ReturnType<typeof signal> }).currentUser = signal(adminUser);
    expect(runGuard([UserRole.TENANT_ADMIN])).toBe(true);
  });

  it('redirects to dashboard when role is not allowed', () => {
    (authService as { currentUser: ReturnType<typeof signal> }).currentUser = signal(adminUser);
    const result = runGuard([UserRole.VIEWER]);
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.createUrlTree(['/dashboard']));
  });

  it('allows access when no roles are specified', () => {
    (authService as { currentUser: ReturnType<typeof signal> }).currentUser = signal(adminUser);
    expect(runGuard([])).toBe(true);
  });
});
