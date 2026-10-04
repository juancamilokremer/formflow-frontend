import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { PlanCardComponent, PlanCardCta } from '../plan-card/plan-card.component';
import { PLAN_CATALOG, PlanCatalogEntry } from '../../../core/models/plan-catalog.model';
import { Plan } from '../../../core/models/tenant.model';

@Component({
  selector: 'app-pricing-section',
  imports: [TranslatePipe, PlanCardComponent],
  templateUrl: './pricing-section.component.html',
  styleUrl: './pricing-section.component.scss',
})
export class PricingSectionComponent {
  /** Null on the public landing teaser; set to the tenant's plan on /plans to highlight it. */
  readonly currentPlan = input<Plan | null>(null);
  /** Landing teaser: short checklist, no CTA buttons — matches the marketing mockup. */
  readonly teaser = input(false);

  readonly upgradeRequested = output<Plan>();

  protected readonly catalog = PLAN_CATALOG;

  protected ctaFor(entry: PlanCatalogEntry): PlanCardCta {
    if (entry.plan === this.currentPlan()) {
      return { kind: 'disabled', labelKey: 'plans.cta.current' };
    }
    if (entry.plan === Plan.ENTERPRISE) {
      return { kind: 'external', href: `mailto:${environment.salesEmail}`, labelKey: 'plans.cta.contact_sales' };
    }
    return { kind: 'action', labelKey: 'plans.cta.upgrade' };
  }

  protected onCtaClicked(plan: Plan): void {
    this.upgradeRequested.emit(plan);
  }
}
