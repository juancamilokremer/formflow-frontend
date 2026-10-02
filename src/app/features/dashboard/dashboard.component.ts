import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { TenantSettingsService } from '../tenants/tenant-settings/services/tenant-settings.service';
import { FormsService } from '../forms/services/forms.service';
import { ConvocatoriaService } from '../convocatorias/services/convocatoria.service';
import { encuestaDetailPath, convocatoriaDetailPath } from '../../core/constants/route.constants';
import { PlanBadgeComponent } from '../../shared/components/plan-badge/plan-badge.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PlanUsageCardComponent } from '../tenants/tenant-settings/components/plan-usage-card/plan-usage-card.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { Form } from '../forms/models/form.model';
import { ConvocatoriaSummary, PROCESS_TYPE_LABEL_KEYS } from '../convocatorias/models/convocatoria.model';
import { TenantUsage } from '../../core/models/tenant.model';

interface RecentActivityItem extends ConvocatoriaSummary {
  path: string[];
}

@Component({
  selector: 'app-dashboard',
  imports: [
    TranslatePipe, DatePipe, RouterLink,
    PlanBadgeComponent, StatCardComponent, EmptyStateComponent, PlanUsageCardComponent, CardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly authService = inject(AuthService);
  private readonly tenantSettingsService = inject(TenantSettingsService);
  private readonly formsService = inject(FormsService);
  private readonly convocatoriaService = inject(ConvocatoriaService);

  /** Set by roleGuard when a route restricted to another role redirects here —
   *  see role.guard.ts. Read once from the snapshot, dismissible, not a global toast. */
  protected readonly accessDenied = signal(this.route.snapshot.queryParamMap.get('accessDenied') === 'true');

  protected readonly forms = signal<Form[]>([]);
  protected readonly convocatorias = signal<ConvocatoriaSummary[]>([]);
  protected readonly usage = signal<TenantUsage | null>(null);

  protected readonly processTypeLabelKeys = PROCESS_TYPE_LABEL_KEYS;

  protected readonly activeFormsCount = computed(
    () => this.forms().filter((f) => f.status === 'ACTIVE').length,
  );

  protected readonly activeConvocatoriasCount = computed(
    () => this.convocatorias().filter((c) => c.status === 'ACTIVE').length,
  );

  /** Convocatorias and encuestas share the same backend entity (see encuestas.component.ts,
   *  which filters this same ConvocatoriaService.getAll() by type === 'REGISTRATION') — one
   *  list, routed to the right detail page per item's type. */
  protected readonly recentActivity = computed<RecentActivityItem[]>(() =>
    [...this.convocatorias()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
      .map((c) => ({
        ...c,
        path: c.type === 'REGISTRATION' ? encuestaDetailPath(c.id) : convocatoriaDetailPath(c.id),
      })),
  );

  constructor() {
    this.formsService.getAll().subscribe({
      next: (forms) => this.forms.set(forms),
      error: () => {},
    });
    this.convocatoriaService.getAll().subscribe({
      next: (convocatorias) => this.convocatorias.set(convocatorias),
      error: () => {},
    });
    this.tenantSettingsService.getUsage().subscribe({
      next: (usage) => this.usage.set(usage),
      error: () => {},
    });
  }

  protected dismissAccessDenied(): void {
    this.accessDenied.set(false);
  }
}
