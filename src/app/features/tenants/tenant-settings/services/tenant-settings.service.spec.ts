import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TenantSettingsService } from './tenant-settings.service';
import { Branding, Plan, Tenant, TenantUsage } from '../../../../core/models/tenant.model';

const mockTenant: Tenant = {
  id: 't1', name: 'Empresa ABC', slug: 'empresa-abc', plan: Plan.FREE,
  logoUrl: null, primaryColor: null, secondaryColor: null,
};

const mockUsage: TenantUsage = {
  plan: Plan.FREE, formsUsed: 2, formsLimit: 2, responsesThisMonth: 38, responsesLimit: 50,
  usersCount: 1, usersLimit: 1, canExportExcel: false,
};

const mockBranding: Branding = {
  tenantName: 'Empresa ABC', logoUrl: null, primaryColor: null, secondaryColor: null, faviconUrl: null,
};

describe('TenantSettingsService', () => {
  let service: TenantSettingsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TenantSettingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getTenant() GETs /tenant and returns the data', () => {
    let result: Tenant | undefined;
    service.getTenant().subscribe((t) => (result = t));

    http.expectOne((r) => r.url.endsWith('/tenant') && r.method === 'GET').flush({ success: true, data: mockTenant });

    expect(result).toEqual(mockTenant);
  });

  it('updateTenant() PUTs the full payload to /tenant', () => {
    const request = { name: 'Nuevo nombre', logoUrl: null, primaryColor: null, secondaryColor: null };
    service.updateTenant(request).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('/tenant') && r.method === 'PUT');
    expect(req.request.body).toEqual(request);
    req.flush({ success: true, data: { ...mockTenant, name: 'Nuevo nombre' } });
  });

  it('getUsage() GETs /tenant/usage and returns the data', () => {
    let result: TenantUsage | undefined;
    service.getUsage().subscribe((u) => (result = u));

    http.expectOne((r) => r.url.endsWith('/tenant/usage') && r.method === 'GET')
      .flush({ success: true, data: mockUsage });

    expect(result).toEqual(mockUsage);
  });

  it('getBranding() GETs /tenant/branding', () => {
    let result: Branding | undefined;
    service.getBranding().subscribe((b) => (result = b));

    http.expectOne((r) => r.url.endsWith('/tenant/branding') && r.method === 'GET')
      .flush({ success: true, data: mockBranding });

    expect(result).toEqual(mockBranding);
  });

  it('updateBranding() PUTs to /tenant/branding', () => {
    const request = { name: 'Empresa ABC', primaryColor: '#111111', secondaryColor: '#222222' };
    service.updateBranding(request).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('/tenant/branding') && r.method === 'PUT');
    expect(req.request.body).toEqual(request);
    req.flush({ success: true, data: { ...mockBranding, ...request } });
  });

  it('uploadLogo() POSTs the file as multipart form data', () => {
    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    service.uploadLogo(file).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('/tenant/branding/logo') && r.method === 'POST');
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).get('file')).toBe(file);
    req.flush({ success: true, data: { ...mockBranding, logoUrl: 'http://x/logo.png' } });
  });

  it('deleteLogo() sends DELETE to /tenant/branding/logo', () => {
    let result: Branding | undefined;
    service.deleteLogo().subscribe((b) => (result = b));

    http.expectOne((r) => r.url.endsWith('/tenant/branding/logo') && r.method === 'DELETE')
      .flush({ success: true, data: mockBranding });

    expect(result).toEqual(mockBranding);
  });
});
