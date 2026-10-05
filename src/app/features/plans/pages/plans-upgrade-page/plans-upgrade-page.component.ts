import { Component, inject, signal } from '@angular/core';
import { TenantSettingsService } from '../../../tenants/tenant-settings/services/tenant-settings.service';
import { PricingSectionComponent } from '../../../../shared/components/pricing-section/pricing-section.component';
import { UpgradeRequestModalComponent } from '../../components/upgrade-request-modal/upgrade-request-modal.component';
import { Plan } from '../../../../core/models/tenant.model';

@Component({
  selector: 'app-plans-upgrade-page',
  imports: [PricingSectionComponent, UpgradeRequestModalComponent],
  templateUrl: './plans-upgrade-page.component.html',
  styleUrl: './plans-upgrade-page.component.scss',
})
export class PlansUpgradePageComponent {
  private readonly tenantSettingsService = inject(TenantSettingsService);

  protected readonly currentPlan = signal<Plan | null>(null);
  protected readonly selectedPlan = signal<Plan | null>(null);
  protected readonly modalOpen = signal(false);

  constructor() {
    this.tenantSettingsService.getUsage().subscribe({
      next: (usage) => this.currentPlan.set(usage.plan),
      error: () => {},
    });
  }

  protected openUpgradeModal(plan: Plan): void {
    this.selectedPlan.set(plan);
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
  }
}
