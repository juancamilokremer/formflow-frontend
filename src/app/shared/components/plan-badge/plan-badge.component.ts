import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BadgeComponent, BadgeVariant } from '../badge/badge.component';
import { Plan } from '../../../core/models/tenant.model';

const VARIANT_BY_PLAN: Record<Plan, BadgeVariant> = {
  [Plan.FREE]: 'neutral',
  [Plan.STARTER]: 'primary',
  [Plan.PRO]: 'purple',
  [Plan.BUSINESS]: 'amber',
  [Plan.ENTERPRISE]: 'orange',
};

@Component({
  selector: 'app-plan-badge',
  imports: [BadgeComponent, TranslatePipe],
  templateUrl: './plan-badge.component.html',
  styleUrl: './plan-badge.component.scss',
})
export class PlanBadgeComponent {
  readonly plan = input.required<Plan>();

  protected readonly variant = computed(() => VARIANT_BY_PLAN[this.plan()]);
}
