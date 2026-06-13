import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../auth.service';
import { signal } from '@angular/core';

function runGuard() {
  return TestBed.runInInjectionContext(() =>
    authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
  );
}

describe('authGuard', () => {
  let authService: Partial<AuthService>;

  beforeEach(() => {
    authService = { isAuthenticated: signal(false) as AuthService['isAuthenticated'] };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    });
  });

  it('returns true when user is authenticated', () => {
    (authService as { isAuthenticated: ReturnType<typeof signal> }).isAuthenticated = signal(true);
    expect(runGuard()).toBe(true);
  });

  it('redirects to /login when not authenticated', () => {
    const result = runGuard();
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.createUrlTree(['/login']));
  });
});
