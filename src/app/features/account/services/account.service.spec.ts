import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AccountService } from './account.service';
import { Me } from '../models/account.model';
import { UserRole } from '../../../core/models/user.model';

const mockMe: Me = {
  firstName: 'Ada', lastName: 'QA', email: 'ada@empresa.com', role: UserRole.EDITOR, avatarUrl: null,
};

describe('AccountService', () => {
  let service: AccountService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AccountService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getMe() GETs /me and returns the data', () => {
    let result: Me | undefined;
    service.getMe().subscribe((m) => (result = m));

    http.expectOne((r) => r.url.endsWith('/me') && r.method === 'GET').flush({ success: true, data: mockMe });

    expect(result).toEqual(mockMe);
  });

  it('updateMe() PUTs firstName/lastName to /me', () => {
    const request = { firstName: 'Ada', lastName: 'QA' };
    service.updateMe(request).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('/me') && r.method === 'PUT');
    expect(req.request.body).toEqual(request);
    req.flush({ success: true, data: mockMe });
  });

  it('uploadAvatar() POSTs the file as multipart form data', () => {
    const file = new File(['x'], 'avatar.png', { type: 'image/png' });
    service.uploadAvatar(file).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('/me/avatar') && r.method === 'POST');
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).get('file')).toBe(file);
    req.flush({ success: true, data: { ...mockMe, avatarUrl: 'http://x/avatar.png' } });
  });

  it('deleteAvatar() sends DELETE to /me/avatar', () => {
    let result: Me | undefined;
    service.deleteAvatar().subscribe((m) => (result = m));

    http.expectOne((r) => r.url.endsWith('/me/avatar') && r.method === 'DELETE')
      .flush({ success: true, data: mockMe });

    expect(result).toEqual(mockMe);
  });
});
