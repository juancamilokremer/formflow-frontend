import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../button/button.component';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent } from '../../icons/icon.component';
import { PlanCatalogEntry } from '../../../core/models/plan-catalog.model';
import { Plan } from '../../../core/models/tenant.model';

export type PlanCardCta =
  | { kind: 'navigate'; routerLink: string[]; labelKey: string }
  | { kind: 'external'; href: string; labelKey: string }
  | { kind: 'action'; labelKey: string }
  | { kind: 'disabled'; labelKey: string };

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

  readonly ctaClicked = output<Plan>();

  protected onCtaClick(): void {
    if (this.cta().kind === 'action') this.ctaClicked.emit(this.entry().plan);
  }
}
