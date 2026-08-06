import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { StatCardComponent } from '../../../../../../shared/components/stat-card/stat-card.component';
import { FormStats } from '../../../../models/form-stats.model';
import { ResponseTimelineComponent } from '../response-timeline/response-timeline.component';

@Component({
  selector: 'app-results-summary',
  imports: [TranslatePipe, StatCardComponent, ResponseTimelineComponent],
  templateUrl: './results-summary.component.html',
  styleUrl: './results-summary.component.scss',
})
export class ResultsSummaryComponent {
  readonly stats = input.required<FormStats>();

  protected readonly completionRateLabel = computed(() => {
    const rate = this.stats().completionRate;
    return rate === null ? '—' : `${Math.round(rate * 100)}%`;
  });

  protected readonly avgResponseTimeLabel = computed(() =>
    formatDurationSeconds(this.stats().avgResponseTimeSeconds));
}

export function formatDurationSeconds(seconds: number | null): string {
  if (seconds === null) return '—';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
}
