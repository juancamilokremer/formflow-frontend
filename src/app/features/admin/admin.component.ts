import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { SelectComponent, SelectOption } from '../../shared/components/select/select.component';
import { PlanBadgeComponent } from '../../shared/components/plan-badge/plan-badge.component';
import { AdminTenantTableComponent } from './components/admin-tenant-table/admin-tenant-table.component';
import { AdminService } from './services/admin.service';
import { AdminPlanFilter, AdminStatusFilter, AdminTenantSummary, GlobalStats } from './models/admin.model';
import { Plan, TenantStatus } from '../../core/models/tenant.model';

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'admin.filter.status_all' },
  { value: TenantStatus.ACTIVE, label: 'admin.table.status_value.active' },
  { value: TenantStatus.SUSPENDED, label: 'admin.table.status_value.suspended' },
  { value: TenantStatus.CANCELLED, label: 'admin.table.status_value.cancelled' },
];

const PLAN_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'admin.filter.plan_all' },
  { value: Plan.FREE, label: 'plans.free' },
  { value: Plan.STARTER, label: 'plans.starter' },
  { value: Plan.PRO, label: 'plans.pro' },
  { value: Plan.ENTERPRISE, label: 'plans.enterprise' },
];

@Component({
  selector: 'app-admin',
  imports: [
    TranslatePipe, PageHeaderComponent, StatCardComponent, SelectComponent,
    PlanBadgeComponent, AdminTenantTableComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  private readonly adminService = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly planOptions = PLAN_OPTIONS;

  protected readonly stats = signal<GlobalStats | null>(null);
  protected readonly tenants = signal<AdminTenantSummary[]>([]);
  protected readonly totalElements = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(20);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly statusFilter = signal<AdminStatusFilter>('ALL');
  protected readonly planFilter = signal<AdminPlanFilter>('ALL');

  protected readonly planBreakdown = computed(() => {
    const byPlan = this.stats()?.tenantsByPlan ?? {};
    return Object.entries(byPlan)
      .filter(([, count]) => (count ?? 0) > 0)
      .map(([plan, count]) => ({ plan: plan as Plan, count: count as number }));
  });

  private loadRequestId = 0;

  constructor() {
    this.adminService.getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (stats) => this.stats.set(stats), error: () => {} });

    effect(() => {
      this.statusFilter();
      this.planFilter();
      this.load(0);
    });
  }

  protected onPageChange(page: number): void {
    this.load(page);
  }

  protected onStatusFilterChange(value: string): void {
    this.statusFilter.set(value as AdminStatusFilter);
  }

  protected onPlanFilterChange(value: string): void {
    this.planFilter.set(value as AdminPlanFilter);
  }

  protected onTenantUpdated(updated: AdminTenantSummary): void {
    this.tenants.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
    this.adminService.getStats().subscribe({ next: (stats) => this.stats.set(stats), error: () => {} });
  }

  private load(page: number): void {
    const requestId = ++this.loadRequestId;
    this.loading.set(true);
    this.loadError.set(false);
    const status = this.statusFilter() === 'ALL' ? undefined : (this.statusFilter() as TenantStatus);
    const plan = this.planFilter() === 'ALL' ? undefined : (this.planFilter() as Plan);
    this.adminService.listTenants(page, this.pageSize(), status, plan)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (requestId !== this.loadRequestId) return;
          this.tenants.set(result.items);
          this.totalElements.set(result.totalElements);
          this.pageIndex.set(result.page);
          this.pageSize.set(result.size);
          this.loading.set(false);
        },
        error: () => {
          if (requestId !== this.loadRequestId) return;
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
  }
}
