import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../../../../shared/components/card/card.component';
import { QuestionStats } from '../../../../models/form-stats.model';
import { PieChartComponent } from '../pie-chart/pie-chart.component';
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { ScaleDistributionComponent } from '../scale-distribution/scale-distribution.component';
import { NpsScoreComponent } from '../nps-score/nps-score.component';
import { MatrixHeatmapComponent } from '../matrix-heatmap/matrix-heatmap.component';

const PIE_MAX_OPTIONS = 6;

@Component({
  selector: 'app-question-stats-card',
  imports: [
    TranslatePipe, CardComponent, PieChartComponent, BarChartComponent,
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

  protected readonly usesPie = computed(() =>
    this.question().type === 'single' && (this.question().distributions?.length ?? 0) <= PIE_MAX_OPTIONS);

  protected readonly usesBar = computed(() =>
    (this.question().type === 'single' && !this.usesPie()) || this.question().type === 'multiple');
}
