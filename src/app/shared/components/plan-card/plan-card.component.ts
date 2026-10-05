import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../button/button.component';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent } from '../../icons/icon.component';
import { PlanCatalogEntry, PlanFeatureItem, PlanLimitKey } from '../../../core/models/plan-catalog.model';
import { Plan } from '../../../core/models/tenant.model';
import { PlanLimits } from '../../../core/models/plan-limits.model';

export type PlanCardCta =
  | { kind: 'navigate'; routerLink: string[]; labelKey: string }
  | { kind: 'external'; href: string; labelKey: string }
  | { kind: 'action'; labelKey: string }
  | { kind: 'disabled'; labelKey: string };

interface ResolvedFeature {
  labelKey: string;
  params?: Record<string, number>;
  included: boolean;
}

const LIMIT_I18N: Record<Exclude<PlanLimitKey, 'canExportExcel'>, { count: string; unlimited: string; zero?: string; countSingular?: string }> = {
  forms: { count: 'plans.catalog.limits.forms_count', unlimited: 'plans.catalog.limits.forms_unlimited' },
  responses: { count: 'plans.catalog.limits.responses_count', unlimited: 'plans.catalog.limits.responses_unlimited' },
  users: {
    count: 'plans.catalog.limits.users_count',
    countSingular: 'plans.catalog.limits.users_count_singular',
    unlimited: 'plans.catalog.limits.users_unlimited',
  },
  convocatorias: {
    count: 'plans.catalog.limits.convocatorias_count',
    unlimited: 'plans.catalog.limits.convocatorias_unlimited',
    zero: 'plans.catalog.limits.convocatorias_none',
  },
};

function limitValueOf(limits: PlanLimits, key: Exclude<PlanLimitKey, 'canExportExcel'>): number | null {
  switch (key) {
    case 'forms': return limits.formsLimit;
    case 'responses': return limits.responsesLimit;
    case 'users': return limits.usersLimit;
    case 'convocatorias': return limits.convocatoriasLimit;
  }
}

@Component({
  selector: 'app-plan-card',
  imports: [TranslatePipe, ButtonComponent, BadgeComponent, IconComponent],
  templateUrl: './plan-card.component.html',
  styleUrl: './plan-card.component.scss',
})
export class PlanCardComponent {
  readonly entry = input.required<PlanCatalogEntry>();
  readonly cta = input.required<PlanCardCta>();
  readonly current = input(false);
  /** Landing teaser: short checklist, no CTA button at all (matches the marketing mockup). */
  readonly teaser = input(false);
  /** Live numbers for this card's own plan — null while loading or if the public fetch
   *  failed, in which case features fall back to their static labelKey/included. */
  readonly liveLimits = input<PlanLimits | null>(null);

  readonly ctaClicked = output<Plan>();

  protected resolve(feature: PlanFeatureItem): ResolvedFeature {
    const limits = this.liveLimits();
    if (!limits || !feature.limitKey) {
      return { labelKey: feature.labelKey, included: feature.included };
    }
    if (feature.limitKey === 'canExportExcel') {
      return { labelKey: feature.labelKey, included: limits.canExportExcel };
    }

    const value = limitValueOf(limits, feature.limitKey);
    const i18n = LIMIT_I18N[feature.limitKey];
    if (value === null) return { labelKey: i18n.unlimited, included: true };
    if (value === 0 && i18n.zero) return { labelKey: i18n.zero, included: false };
    if (value === 1 && i18n.countSingular) return { labelKey: i18n.countSingular, params: { n: value }, included: true };
    return { labelKey: i18n.count, params: { n: value }, included: true };
  }

  protected onCtaClick(): void {
    if (this.cta().kind === 'action') this.ctaClicked.emit(this.entry().plan);
  }
}
