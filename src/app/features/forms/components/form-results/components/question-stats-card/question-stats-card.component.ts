import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../../../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { QuestionStats } from '../../../../models/form-stats.model';
import { PieChartComponent } from '../pie-chart/pie-chart.component';
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { ScaleDistributionComponent } from '../scale-distribution/scale-distribution.component';
import { NpsScoreComponent } from '../nps-score/nps-score.component';
import { MatrixHeatmapComponent } from '../matrix-heatmap/matrix-heatmap.component';

const PIE_MAX_OPTIONS = 6;
const CHOICE_TYPES = ['single', 'multiple'];

export type QuestionDisplayMode = 'no-options' | 'pie' | 'bar' | 'scale' | 'nps' | 'matrix' | 'text' | 'none';

export function resolveDisplayMode(question: QuestionStats): QuestionDisplayMode {
  const optionCount = question.distributions?.length ?? 0;

  if (CHOICE_TYPES.includes(question.type)) {
    // A single/multiple question can exist with no options configured yet (e.g. an
    // incomplete question left over from the builder) — distributions comes back
    // empty, which would otherwise reach PieChartComponent/BarChartComponent with
    // no data to plot and render a degenerate, meaningless axis.
    if (optionCount === 0) return 'no-options';
    return question.type === 'single' && optionCount <= PIE_MAX_OPTIONS ? 'pie' : 'bar';
  }
  if (question.type === 'scale') return 'scale';
  if (question.type === 'nps') return 'nps';
  if (question.type === 'matrix') return 'matrix';
  if (question.type === 'text') return 'text';
  return 'none';
}

@Component({
  selector: 'app-question-stats-card',
  imports: [
    TranslatePipe, CardComponent, EmptyStateComponent, PieChartComponent, BarChartComponent,
    ScaleDistributionComponent, NpsScoreComponent, MatrixHeatmapComponent,
  ],
  templateUrl: './question-stats-card.component.html',
  styleUrl: './question-stats-card.component.scss',
})
export class QuestionStatsCardComponent {
  readonly question = input.required<QuestionStats>();

  protected readonly answeredPct = computed(() => {
    const q = this.question();
    return q.totalResponses === 0 ? 0 : Math.round((q.answeredCount / q.totalResponses) * 100);
  });

  protected readonly displayMode = computed(() => resolveDisplayMode(this.question()));
}
