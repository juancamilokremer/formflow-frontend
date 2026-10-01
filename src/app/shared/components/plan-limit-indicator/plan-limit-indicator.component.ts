import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

const WARNING_THRESHOLD = 0.9;

@Component({
  selector: 'app-plan-limit-indicator',
  imports: [TranslatePipe],
  templateUrl: './plan-limit-indicator.component.html',
  styleUrl: './plan-limit-indicator.component.scss',
})
export class PlanLimitIndicatorComponent {
  /** An i18n key, not already-translated text — translated in this component's own template. */
  readonly label = input.required<string>();
  readonly used = input.required<number>();
  /** null means the plan has no cap on this resource. */
  readonly limit = input.required<number | null>();

  protected readonly isUnlimited = computed(() => this.limit() === null);

  protected readonly percentage = computed(() => {
    const limit = this.limit();
    if (limit === null || limit <= 0) return 0;
    return Math.min(100, Math.round((this.used() / limit) * 100));
  });

  /** Extracted as its own method so it's directly unit-testable without touching the DOM. */
  protected readonly isOverThreshold = computed(() => {
    const limit = this.limit();
    if (limit === null || limit <= 0) return false;
    return this.used() / limit >= WARNING_THRESHOLD;
  });
}
