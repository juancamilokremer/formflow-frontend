import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AdminComponent } from './admin.component';
import { AdminService } from './services/admin.service';
import { AdminTenantPage, AdminTenantSummary, GlobalStats } from './models/admin.model';
import { Plan, TenantStatus } from '../../core/models/tenant.model';

const TENANT: AdminTenantSummary = {
  id: 't1', slug: 'empresa-1', name: 'Empresa 1', plan: Plan.FREE, status: TenantStatus.ACTIVE,
  createdAt: '2026-01-01T00:00:00Z',
};

const MOCK_PAGE: AdminTenantPage = { items: [TENANT], totalElements: 1, totalPages: 1, page: 0, size: 20 };

const MOCK_STATS: GlobalStats = {
  totalTenants: 10,
  responsesThisMonth: 42,
  tenantsByPlan: { [Plan.FREE]: 7, [Plan.PRO]: 3 },
};

function buildComponent(overrides: { listTenantsImpl?: unknown; getStatsImpl?: unknown } = {}) {
  const mockAdminService = {
    listTenants: overrides.listTenantsImpl ?? vi.fn().mockReturnValue(of(MOCK_PAGE)),
    getStats: overrides.getStatsImpl ?? vi.fn().mockReturnValue(of(MOCK_STATS)),
  };

  TestBed.configureTestingModule({
    imports: [AdminComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: AdminService, useValue: mockAdminService },
    ],
  });

  const fixture = TestBed.createComponent(AdminComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockAdminService, fixture };
}

describe('AdminComponent', () => {
  it('loads stats and the first page of tenants on init', () => {
    const { component, mockAdminService } = buildComponent();
    expect(mockAdminService.getStats).toHaveBeenCalled();
    expect(mockAdminService.listTenants).toHaveBeenCalledWith(0, 20, undefined, undefined);
    expect(component['stats']()).toEqual(MOCK_STATS);
    expect(component['tenants']()).toEqual([TENANT]);
    expect(component['totalElements']()).toBe(1);
    expect(component['loading']()).toBe(false);
  });

  it('computes the plan breakdown, excluding zero-count plans', () => {
    const { component } = buildComponent();
    expect(component['planBreakdown']()).toEqual([
      { plan: Plan.FREE, count: 7 },
      { plan: Plan.PRO, count: 3 },
    ]);
  });

  it('sets loadError on failure', () => {
    const { component } = buildComponent({
      listTenantsImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
    });
    expect(component['loadError']()).toBe(true);
    expect(component['loading']()).toBe(false);
  });

  it('reloads page 0 when the status filter changes', () => {
    const { component, mockAdminService, fixture } = buildComponent();
    (mockAdminService.listTenants as any).mockClear();
    component['onStatusFilterChange'](TenantStatus.SUSPENDED);
    fixture.detectChanges();
    expect(mockAdminService.listTenants).toHaveBeenCalledWith(0, 20, TenantStatus.SUSPENDED, undefined);
  });

  it('reloads page 0 when the plan filter changes', () => {
    const { component, mockAdminService, fixture } = buildComponent();
    (mockAdminService.listTenants as any).mockClear();
    component['onPlanFilterChange'](Plan.PRO);
    fixture.detectChanges();
    expect(mockAdminService.listTenants).toHaveBeenCalledWith(0, 20, undefined, Plan.PRO);
  });

  it('reloads with the requested page on pageChange', () => {
    const { component, mockAdminService } = buildComponent();
    (mockAdminService.listTenants as any).mockClear();
    component['onPageChange'](3);
    expect(mockAdminService.listTenants).toHaveBeenCalledWith(3, 20, undefined, undefined);
  });

  it('switches the active tab', () => {
    const { component } = buildComponent();
    expect(component['activeTab']()).toBe('tenants');

    component['setActiveTab']('plan-limits');

    expect(component['activeTab']()).toBe('plan-limits');
  });

  it('patches the updated tenant into the list and refreshes stats', () => {
    const { component, mockAdminService } = buildComponent();
    const updated: AdminTenantSummary = { ...TENANT, plan: Plan.STARTER };
    (mockAdminService.getStats as any).mockClear();

    component['onTenantUpdated'](updated);

    expect(component['tenants']()).toEqual([updated]);
    expect(mockAdminService.getStats).toHaveBeenCalled();
  });
});
