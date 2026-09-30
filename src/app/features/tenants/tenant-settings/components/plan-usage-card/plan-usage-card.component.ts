import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../../../shared/components/card/card.component';
import { PlanLimitIndicatorComponent } from '../../../../../shared/components/plan-limit-indicator/plan-limit-indicator.component';
import { TenantUsage } from '../../../../../core/models/tenant.model';
import { TenantSettingsService } from '../../services/tenant-settings.service';

@Component({
  selector: 'app-plan-usage-card',
  imports: [TranslatePipe, CardComponent, PlanLimitIndicatorComponent],
  templateUrl: './plan-usage-card.component.html',
  styleUrl: './plan-usage-card.component.scss',
})
export class PlanUsageCardComponent implements OnInit {
  private readonly tenantSettingsService = inject(TenantSettingsService);

  protected readonly loading = signal(true);
  protected readonly usage = signal<TenantUsage | null>(null);

  ngOnInit(): void {
    this.tenantSettingsService.getUsage().subscribe({
      next: (usage) => {
        this.usage.set(usage);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
