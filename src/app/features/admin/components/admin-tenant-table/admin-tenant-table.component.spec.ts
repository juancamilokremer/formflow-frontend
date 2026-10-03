import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { AdminTenantTableComponent } from './admin-tenant-table.component';
import { AdminService } from '../../services/admin.service';
import { AdminTenantSummary } from '../../models/admin.model';
import { Plan, TenantStatus } from '../../../../core/models/tenant.model';

const TENANTS: AdminTenantSummary[] = [
  { id: 't1', slug: 'empresa-activa', name: 'Empresa Activa', plan: Plan.FREE, status: TenantStatus.ACTIVE, createdAt: '2026-01-01T00:00:00Z' },
  { id: 't2', slug: 'empresa-suspendida', name: 'Empresa Suspendida', plan: Plan.PRO, status: TenantStatus.SUSPENDED, createdAt: '2026-01-02T00:00:00Z' },
];

describe('AdminTenantTableComponent', () => {
  let component: AdminTenantTableComponent;
  let fixture: ComponentFixture<AdminTenantTableComponent>;
  let mockService: {
    changePlan: ReturnType<typeof vi.fn>;
    activateTenant: ReturnType<typeof vi.fn>;
    suspendTenant: ReturnType<typeof vi.fn>;
  };

  function setup() {
    mockService = {
      changePlan: vi.fn().mockReturnValue(of({ ...TENANTS[0], plan: Plan.STARTER })),
      activateTenant: vi.fn().mockReturnValue(of({ ...TENANTS[1], status: TenantStatus.ACTIVE })),
      suspendTenant: vi.fn().mockReturnValue(of({ ...TENANTS[0], status: TenantStatus.SUSPENDED })),
    };

    TestBed.configureTestingModule({
      imports: [AdminTenantTableComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: AdminService, useValue: mockService },
      ],
    });

    fixture = TestBed.createComponent(AdminTenantTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('rows', TENANTS);
    fixture.detectChanges();
  }

  it('maps each status to its badge variant', () => {
    setup();
    expect(component['statusVariant'](TenantStatus.ACTIVE)).toBe('primary');
    expect(component['statusVariant'](TenantStatus.SUSPENDED)).toBe('amber');
    expect(component['statusVariant'](TenantStatus.CANCELLED)).toBe('neutral');
  });

  it('emits pageChange', () => {
    setup();
    let emitted: number | undefined;
    component.pageChange.subscribe((p) => (emitted = p));
    component['onPageChange'](2);
    expect(emitted).toBe(2);
  });

  it('calls changePlan and emits the updated tenant', () => {
    setup();
    let emitted: AdminTenantSummary | undefined;
    component.tenantUpdated.subscribe((t) => (emitted = t));

    component['onPlanChange'](TENANTS[0], Plan.STARTER);

    expect(mockService.changePlan).toHaveBeenCalledWith('t1', Plan.STARTER);
    expect(emitted?.plan).toBe(Plan.STARTER);
    expect(component['savingPlanId']()).toBeNull();
  });

  it('does not call the API when the selected plan is unchanged', () => {
    setup();
    component['onPlanChange'](TENANTS[0], Plan.FREE);
    expect(mockService.changePlan).not.toHaveBeenCalled();
  });

  it('shows the backend message when changing plan fails', () => {
    mockService = {
      changePlan: vi.fn().mockReturnValue(throwError(() => ({ error: { message: 'Plan inválido' } }))),
      activateTenant: vi.fn(),
      suspendTenant: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [AdminTenantTableComponent],
      providers: [provideTranslateService({ lang: 'es' }), { provide: AdminService, useValue: mockService }],
    });
    fixture = TestBed.createComponent(AdminTenantTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('rows', TENANTS);
    fixture.detectChanges();

    component['onPlanChange'](TENANTS[0], Plan.STARTER);

    expect(component['actionError']()).toBe('Plan inválido');
  });

  it('activates a tenant and emits the updated tenant', () => {
    setup();
    let emitted: AdminTenantSummary | undefined;
    component.tenantUpdated.subscribe((t) => (emitted = t));

    component['activate'](TENANTS[1]);

    expect(mockService.activateTenant).toHaveBeenCalledWith('t2');
    expect(emitted?.status).toBe(TenantStatus.ACTIVE);
    expect(component['activatingId']()).toBeNull();
  });

  it('opens and cancels the suspend confirmation', () => {
    setup();
    component['confirmSuspend']('t1');
    expect(component['pendingSuspendId']()).toBe('t1');
    component['cancelSuspend']();
    expect(component['pendingSuspendId']()).toBeNull();
  });

  it('suspends a tenant and emits the updated tenant', () => {
    setup();
    let emitted: AdminTenantSummary | undefined;
    component.tenantUpdated.subscribe((t) => (emitted = t));

    component['confirmSuspend']('t1');
    component['suspend']();

    expect(mockService.suspendTenant).toHaveBeenCalledWith('t1');
    expect(emitted?.status).toBe(TenantStatus.SUSPENDED);
    expect(component['pendingSuspendId']()).toBeNull();
  });

  it('does nothing when suspending with no pending id', () => {
    setup();
    component['suspend']();
    expect(mockService.suspendTenant).not.toHaveBeenCalled();
  });
});
