import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { TokenService } from '../auth/token.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let tokenService: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        TokenService,
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService);
  });

  afterEach(() => httpMock.verify());

  it('adds Authorization header when access token is present', () => {
    tokenService.setTokens({ accessToken: 'my-token', refreshToken: 'ref' }, 'acme');

    http.get('/api/v1/forms').subscribe();

    const req = httpMock.expectOne('/api/v1/forms');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('adds X-Tenant-ID header from stored slug', () => {
    tokenService.setTokens({ accessToken: 'tok', refreshToken: 'ref' }, 'mi-empresa');

    http.get('/api/v1/forms').subscribe();

    const req = httpMock.expectOne('/api/v1/forms');
    expect(req.request.headers.get('X-Tenant-ID')).toBe('mi-empresa');
    req.flush({});
  });

  it('does not add Authorization when no token', () => {
    http.get('/api/v1/auth/login').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
