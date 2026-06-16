import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenService: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', redirectTo: '' }]),
        AuthService,
        TokenService,
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService);
  });

  afterEach(() => httpMock.verify());

  it('should start with no user', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  describe('login', () => {
    it('stores tokens and sets currentUser on success', () => {
      service.login({ email: 'a@b.com', password: '12345678', tenantSlug: 'acme' }).subscribe();

      httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({
        success: true,
        data: {
          accessToken: 'acc',
          refreshToken: 'ref',
          tokenType: 'Bearer',
          expiresInMs: 3600000,
          user: { id: 'u1', email: 'a@b.com', fullName: 'Juan Kremer', role: 'TENANT_ADMIN', emailVerified: false },
          tenant: { id: 't1', slug: 'acme', name: 'Acme Corp', plan: 'FREE' },
        },
      });

      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.email).toBe('a@b.com');
      expect(service.currentUser()?.firstName).toBe('Juan');
      expect(service.currentUser()?.tenantId).toBe('t1');
      expect(tokenService.getRefreshToken()).toBe('ref');
    });
  });

  describe('register', () => {
    it('maps the response data without touching tokens or currentUser', () => {
      let result: { user: { email: string }; tenant: { slug: string } } | undefined;
      service
        .register({
          companyName: 'Acme',
          slug: 'acme',
          email: 'admin@acme.com',
          password: '12345678',
          firstName: 'Juan',
          lastName: 'Kremer',
        })
        .subscribe((res) => (result = res));

      httpMock.expectOne(`${environment.apiUrl}/auth/register`).flush({
        success: true,
        data: {
          user: { id: 'u1', email: 'admin@acme.com', fullName: 'Juan Kremer', role: 'TENANT_ADMIN', emailVerified: false },
          tenant: { id: 't1', slug: 'acme', name: 'Acme', plan: 'FREE' },
        },
      });

      expect(result?.user.email).toBe('admin@acme.com');
      expect(result?.tenant.slug).toBe('acme');
      expect(service.isAuthenticated()).toBe(false);
      expect(tokenService.getRefreshToken()).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears tokens and resets currentUser', () => {
      tokenService.setTokens({ accessToken: 'acc', refreshToken: 'ref' }, 'acme');
      service.logout();
      expect(service.currentUser()).toBeNull();
      expect(tokenService.getAccessToken()).toBeNull();
    });
  });

  describe('initialize', () => {
    it('resolves immediately when no refresh token stored', () => {
      let resolved = false;
      service.initialize().subscribe(() => (resolved = true));
      expect(resolved).toBe(true);
    });
  });
});
