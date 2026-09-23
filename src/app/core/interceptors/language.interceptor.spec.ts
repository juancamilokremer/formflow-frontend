import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { languageInterceptor } from './language.interceptor';
import { StorageKeys } from '../storage/storage-keys.constants';

describe('languageInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([languageInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('defaults to the app default language when nothing is stored', () => {
    http.get('/api/v1/forms').subscribe();

    const req = httpMock.expectOne('/api/v1/forms');
    expect(req.request.headers.get('Accept-Language')).toBe('es');
    req.flush({});
  });

  it('reflects the language persisted in storage', () => {
    localStorage.setItem(StorageKeys.LANGUAGE, JSON.stringify('en'));

    http.get('/api/v1/forms').subscribe();

    const req = httpMock.expectOne('/api/v1/forms');
    expect(req.request.headers.get('Accept-Language')).toBe('en');
    req.flush({});
  });

  it('reads storage fresh on every request, reflecting a mid-session switch', () => {
    http.get('/api/v1/first').subscribe();
    httpMock.expectOne('/api/v1/first').flush({});

    localStorage.setItem(StorageKeys.LANGUAGE, JSON.stringify('en'));

    http.get('/api/v1/second').subscribe();
    const req = httpMock.expectOne('/api/v1/second');
    expect(req.request.headers.get('Accept-Language')).toBe('en');
    req.flush({});
  });
});
