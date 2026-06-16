import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { publicGuard } from './public.guard';
import { AuthService } from '../auth.service';
import { signal } from '@angular/core';

function runGuard() {
  return TestBed.runInInjectionContext(() =>
    publicGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
  );
}

describe('publicGuard', () => {
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

  it('returns true when user is not authenticated', () => {
    expect(runGuard()).toBe(true);
  });

  it('redirects to /dashboard when already authenticated', () => {
    (authService as { isAuthenticated: ReturnType<typeof signal> }).isAuthenticated = signal(true);
    const result = runGuard();
    const router = TestBed.inject(Router);
    expect(result).toEqual(router.createUrlTree(['/dashboard']));
  });
});
