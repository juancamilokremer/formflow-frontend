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
      const user = { id: '1', tenantId: 't1', email: 'a@b.com', firstName: 'Juan', lastName: 'K', role: 'TENANT_ADMIN', emailVerified: false };
      const tokens = { accessToken: 'acc', refreshToken: 'ref' };

      service.login({ email: 'a@b.com', password: '12345678', tenantSlug: 'acme' }).subscribe();

      httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({ success: true, data: { user, tokens } });

      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.email).toBe('a@b.com');
      expect(tokenService.getRefreshToken()).toBe('ref');
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
