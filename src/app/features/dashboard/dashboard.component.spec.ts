import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/auth/auth.service';
import { FormsService } from '../forms/services/forms.service';
import { ConvocatoriaService } from '../convocatorias/services/convocatoria.service';
import { TenantSettingsService } from '../tenants/tenant-settings/services/tenant-settings.service';
import { Form } from '../forms/models/form.model';
import { ConvocatoriaSummary } from '../convocatorias/models/convocatoria.model';
import { Plan } from '../../core/models/tenant.model';
import { encuestaDetailPath, convocatoriaDetailPath } from '../../core/constants/route.constants';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockAuthService = {
    resendVerification: () => of(undefined),
    currentUser: signal(null),
    isAuthenticated: signal(false),
    initialize: () => of(undefined),
    logout: () => {},
    refreshToken: () => of(undefined),
  };

  const mockForms: Form[] = [
    { id: 'f1', name: 'Form 1', description: null, type: 'CANDIDATES', status: 'ACTIVE', version: 1, sectionCount: 1 } as Form,
    { id: 'f2', name: 'Form 2', description: null, type: 'CANDIDATES', status: 'DRAFT', version: 1, sectionCount: 1 } as Form,
  ];

  const mockConvocatorias: ConvocatoriaSummary[] = [
    { id: 'c1', name: 'Convocatoria vieja', type: 'CANDIDATES', status: 'ACTIVE', candidateCount: 1, respondedCount: 0, startDate: null, endDate: null, createdAt: '2026-01-01T00:00:00Z' },
    { id: 'c2', name: 'Encuesta nueva', type: 'REGISTRATION', status: 'DRAFT', candidateCount: 0, respondedCount: 0, startDate: null, endDate: null, createdAt: '2026-03-01T00:00:00Z' },
    { id: 'c3', name: 'Convocatoria cerrada', type: 'CANDIDATES', status: 'CLOSED', candidateCount: 2, respondedCount: 2, startDate: null, endDate: null, createdAt: '2026-02-01T00:00:00Z' },
  ];

  const mockUsage = {
    plan: Plan.PRO,
    formsUsed: 2,
    formsLimit: null,
    responsesThisMonth: 10,
    responsesLimit: null,
    usersCount: 3,
    usersLimit: null,
    canExportExcel: true,
  };

  const mockFormsService = { getAll: () => of(mockForms) };
  const mockConvocatoriaService = { getAll: () => of(mockConvocatorias) };
  const mockTenantSettingsService = { getUsage: () => of(mockUsage) };

  function setup(queryParams: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
        { provide: FormsService, useValue: mockFormsService },
        { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
        { provide: TenantSettingsService, useValue: mockTenantSettingsService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
        },
      ],
    });

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('shows the access-denied banner when redirected by roleGuard', () => {
    setup({ accessDenied: 'true' });
    expect(component['accessDenied']()).toBe(true);
  });

  it('does not show the banner on a normal visit', () => {
    setup();
    expect(component['accessDenied']()).toBe(false);
  });

  it('dismisses the banner', () => {
    setup({ accessDenied: 'true' });
    component['dismissAccessDenied']();
    expect(component['accessDenied']()).toBe(false);
  });

  it('counts only active forms', () => {
    setup();
    expect(component['activeFormsCount']()).toBe(1);
  });

  it('counts only active convocatorias', () => {
    setup();
    expect(component['activeConvocatoriasCount']()).toBe(1);
  });

  it('sorts recent activity by createdAt descending', () => {
    setup();
    const names = component['recentActivity']().map((item) => item.name);
    expect(names).toEqual(['Encuesta nueva', 'Convocatoria cerrada', 'Convocatoria vieja']);
  });

  it('routes each recent activity item by its type', () => {
    setup();
    const items = component['recentActivity']();
    const encuesta = items.find((item) => item.id === 'c2')!;
    const convocatoria = items.find((item) => item.id === 'c1')!;
    expect(encuesta.path).toEqual(encuestaDetailPath('c2'));
    expect(convocatoria.path).toEqual(convocatoriaDetailPath('c1'));
  });

  it('shows an empty recent activity list when there are no convocatorias', () => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
        { provide: FormsService, useValue: mockFormsService },
        { provide: ConvocatoriaService, useValue: { getAll: () => of([]) } },
        { provide: TenantSettingsService, useValue: mockTenantSettingsService },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ],
    });
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    expect(component['recentActivity']()).toEqual([]);
  });
});
