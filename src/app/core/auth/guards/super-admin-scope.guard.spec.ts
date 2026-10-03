import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { superAdminScopeGuard } from './super-admin-scope.guard';
import { AuthService } from '../auth.service';
import { UserRole } from '../../models/user.model';

const tenantAdmin = { id: '1', tenantId: 't1', email: 'a@b.com', firstName: '', lastName: '', role: UserRole.TENANT_ADMIN, emailVerified: true };
const superAdmin = { ...tenantAdmin, role: UserRole.SUPER_ADMIN };

function runGuard(path: string, user = tenantAdmin) {
  const route = { routeConfig: { path } } as unknown as ActivatedRouteSnapshot;
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: { currentUser: signal(user) } },
    ],
  });
  return TestBed.runInInjectionContext(() => superAdminScopeGuard(route, {} as RouterStateSnapshot));
}

describe('superAdminScopeGuard', () => {
  it('allows a non-SUPER_ADMIN user into any route', () => {
    expect(runGuard('dashboard', tenantAdmin)).toBe(true);
  });

  it('allows an unauthenticated request through (authGuard handles that separately)', () => {
    expect(runGuard('dashboard', null as any)).toBe(true);
  });

  it('allows SUPER_ADMIN into /admin', () => {
    expect(runGuard('admin', superAdmin)).toBe(true);
  });

  it('allows SUPER_ADMIN into /account', () => {
    expect(runGuard('account', superAdmin)).toBe(true);
  });

  it('redirects SUPER_ADMIN away from every other tenant-scoped route to /admin', () => {
    const result = runGuard('dashboard', superAdmin);
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.createUrlTree(['/admin']));
  });

  it('redirects SUPER_ADMIN away from a deeply nested unguarded route (e.g. the form builder)', () => {
    const result = runGuard('encuestas/:containerId/formularios/:id', superAdmin);
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.createUrlTree(['/admin']));
  });
});
