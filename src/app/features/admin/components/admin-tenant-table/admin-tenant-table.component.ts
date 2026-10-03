import { Component, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AppTableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { TableCellDirective } from '../../../../shared/components/table/table-cell.directive';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BadgeComponent, BadgeVariant } from '../../../../shared/components/badge/badge.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Plan, TenantStatus } from '../../../../core/models/tenant.model';
import { AdminService } from '../../services/admin.service';
import { AdminTenantSummary } from '../../models/admin.model';

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'name', header: 'admin.table.name' },
  { key: 'slug', header: 'admin.table.slug' },
  { key: 'plan', header: 'admin.table.plan' },
  { key: 'status', header: 'admin.table.status' },
  { key: 'createdAt', header: 'admin.table.created' },
  { key: '__actions', header: '', align: 'right' },
];

const PLAN_OPTIONS: SelectOption[] = [
  { value: Plan.FREE, label: 'plans.free' },
  { value: Plan.STARTER, label: 'plans.starter' },
  { value: Plan.PRO, label: 'plans.pro' },
  { value: Plan.BUSINESS, label: 'plans.business' },
  { value: Plan.ENTERPRISE, label: 'plans.enterprise' },
];

const VARIANT_BY_STATUS: Record<TenantStatus, BadgeVariant> = {
  [TenantStatus.ACTIVE]: 'primary',
  [TenantStatus.SUSPENDED]: 'amber',
  [TenantStatus.CANCELLED]: 'neutral',
};

@Component({
  selector: 'app-admin-tenant-table',
  imports: [
    TranslatePipe, DatePipe,
    AppTableComponent, TableCellDirective,
    ButtonComponent, BadgeComponent, SelectComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './admin-tenant-table.component.html',
  styleUrl: './admin-tenant-table.component.scss',
})
export class AdminTenantTableComponent {
  private readonly adminService = inject(AdminService);
  private readonly translate = inject(TranslateService);

  readonly rows = input.required<AdminTenantSummary[]>();
  readonly totalElements = input(0);
  readonly pageIndex = input(0);
  readonly pageSize = input(20);
  readonly loading = input(false);
  readonly loadError = input(false);

  readonly pageChange = output<number>();
  readonly tenantUpdated = output<AdminTenantSummary>();

  protected readonly tableColumns = TABLE_COLUMNS;
  protected readonly planOptions = PLAN_OPTIONS;
  protected readonly TenantStatus = TenantStatus;

  protected readonly savingPlanId = signal<string | null>(null);
  protected readonly activatingId = signal<string | null>(null);
  protected readonly pendingSuspendId = signal<string | null>(null);
  protected readonly suspending = signal(false);
  protected readonly actionError = signal<string | null>(null);

  protected statusVariant(status: TenantStatus): BadgeVariant {
    return VARIANT_BY_STATUS[status];
  }

  protected onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  protected onPlanChange(tenant: AdminTenantSummary, plan: string): void {
    if (plan === tenant.plan) return;
    this.actionError.set(null);
    this.savingPlanId.set(tenant.id);
    this.adminService.changePlan(tenant.id, plan as Plan).subscribe({
      next: (updated) => {
        this.savingPlanId.set(null);
        this.tenantUpdated.emit(updated);
      },
      error: (err: HttpErrorResponse) => {
        this.savingPlanId.set(null);
        this.actionError.set(err.error?.message ?? this.translate.instant('admin.table.error_generic'));
      },
    });
  }

  protected activate(tenant: AdminTenantSummary): void {
    this.actionError.set(null);
    this.activatingId.set(tenant.id);
    this.adminService.activateTenant(tenant.id).subscribe({
      next: (updated) => {
        this.activatingId.set(null);
        this.tenantUpdated.emit(updated);
      },
      error: (err: HttpErrorResponse) => {
        this.activatingId.set(null);
        this.actionError.set(err.error?.message ?? this.translate.instant('admin.table.error_generic'));
      },
    });
  }

  protected confirmSuspend(id: string): void {
    this.actionError.set(null);
    this.pendingSuspendId.set(id);
  }

  protected cancelSuspend(): void {
    this.pendingSuspendId.set(null);
  }

  protected suspend(): void {
    const id = this.pendingSuspendId();
    if (!id) return;
    this.suspending.set(true);
    this.adminService.suspendTenant(id).subscribe({
      next: (updated) => {
        this.suspending.set(false);
        this.pendingSuspendId.set(null);
        this.tenantUpdated.emit(updated);
      },
      error: (err: HttpErrorResponse) => {
        this.suspending.set(false);
        this.pendingSuspendId.set(null);
        this.actionError.set(err.error?.message ?? this.translate.instant('admin.table.error_generic'));
      },
    });
  }
}
