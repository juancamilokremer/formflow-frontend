import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CheckboxComponent } from '../../../../shared/components/checkbox/checkbox.component';
import { AdminService } from '../../services/admin.service';
import { EditableLimitField, EditablePlanLimitsRow, LimitFieldKey } from '../../models/admin.model';
import { PlanLimits, UpdatePlanLimitsRequest } from '../../../../core/models/plan-limits.model';
import { Plan } from '../../../../core/models/tenant.model';

@Component({
  selector: 'app-plan-limits-editor',
  imports: [TranslatePipe, CardComponent, ButtonComponent, CheckboxComponent],
  templateUrl: './plan-limits-editor.component.html',
  styleUrl: './plan-limits-editor.component.scss',
})
export class PlanLimitsEditorComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly translate = inject(TranslateService);

  protected readonly rows = signal<EditablePlanLimitsRow[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  ngOnInit(): void {
    this.adminService.getPlanLimits().subscribe({
      next: (limits) => {
        this.rows.set(limits.map((limit) => this.toRow(limit)));
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  protected onUnlimitedChange(plan: Plan, field: LimitFieldKey, unlimited: boolean): void {
    this.updateRow(plan, (row) => ({ ...row, [field]: { ...row[field], unlimited } }));
  }

  protected onValueChange(plan: Plan, field: LimitFieldKey, raw: string): void {
    const value = Math.max(0, Math.trunc(Number(raw)) || 0);
    this.updateRow(plan, (row) => ({ ...row, [field]: { ...row[field], value } }));
  }

  protected onExportChange(plan: Plan, canExportExcel: boolean): void {
    this.updateRow(plan, (row) => ({ ...row, canExportExcel }));
  }

  protected save(plan: Plan): void {
    const row = this.rows().find((r) => r.plan === plan);
    if (!row) return;

    this.updateRow(plan, (r) => ({ ...r, saving: true, saved: false, error: null }));

    const request: UpdatePlanLimitsRequest = {
      formsLimit: this.toRequestValue(row.forms),
      responsesLimit: this.toRequestValue(row.responses),
      usersLimit: this.toRequestValue(row.users),
      convocatoriasLimit: this.toRequestValue(row.convocatorias),
      canExportExcel: row.canExportExcel,
    };

    this.adminService.updatePlanLimits(plan, request).subscribe({
      next: (updated) => this.updateRow(plan, () => ({ ...this.toRow(updated), saved: true })),
      error: (err: HttpErrorResponse) => this.updateRow(plan, (r) => ({
        ...r,
        saving: false,
        error: err.error?.message ?? this.translate.instant('admin.plan_limits.error_generic'),
      })),
    });
  }

  private updateRow(plan: Plan, updater: (row: EditablePlanLimitsRow) => EditablePlanLimitsRow): void {
    this.rows.update((list) => list.map((row) => (row.plan === plan ? updater(row) : row)));
  }

  private toRow(limits: PlanLimits): EditablePlanLimitsRow {
    return {
      plan: limits.plan,
      forms: this.toField(limits.formsLimit),
      responses: this.toField(limits.responsesLimit),
      users: this.toField(limits.usersLimit),
      convocatorias: this.toField(limits.convocatoriasLimit),
      canExportExcel: limits.canExportExcel,
      saving: false,
      saved: false,
      error: null,
    };
  }

  private toField(limit: number | null): EditableLimitField {
    return { value: limit ?? 0, unlimited: limit === null };
  }

  private toRequestValue(field: EditableLimitField): number | null {
    return field.unlimited ? null : field.value;
  }
}
