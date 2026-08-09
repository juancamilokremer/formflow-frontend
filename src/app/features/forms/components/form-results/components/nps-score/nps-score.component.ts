import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ApexChart, ApexPlotOptions, NgApexchartsModule } from 'ng-apexcharts';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { OptionDistribution } from '../../../../models/form-stats.model';
import { FORMFLOW_ERROR, FORMFLOW_SUCCESS, FORMFLOW_WARNING } from '../chart-colors';

export interface NpsBreakdown {
  promoters: number;
  passives: number;
  detractors: number;
}

export function computeNpsBreakdown(distributions: OptionDistribution[]): NpsBreakdown {
  let promoters = 0;
  let passives = 0;
  let detractors = 0;
  for (const d of distributions) {
    const value = Number(d.label);
    if (value >= 9) promoters += d.count;
    else if (value >= 7) passives += d.count;
    else detractors += d.count;
  }
  return { promoters, passives, detractors };
}

@Component({
  selector: 'app-nps-score',
  imports: [TranslatePipe, NgApexchartsModule, EmptyStateComponent],
  templateUrl: './nps-score.component.html',
  styleUrl: './nps-score.component.scss',
})
export class NpsScoreComponent {
  readonly npsScore = input<number | null>(null);
  readonly distributions = input.required<OptionDistribution[]>();

  protected readonly breakdown = computed(() => computeNpsBreakdown(this.distributions()));

  protected readonly totalAnswered = computed(() => {
    const b = this.breakdown();
    return b.promoters + b.passives + b.detractors;
  });

  protected readonly promotersPct = computed(() => this.pct(this.breakdown().promoters));
  protected readonly passivesPct = computed(() => this.pct(this.breakdown().passives));
  protected readonly detractorsPct = computed(() => this.pct(this.breakdown().detractors));

  private pct(count: number): number {
    const total = this.totalAnswered();
    return total === 0 ? 0 : Math.round((count / total) * 100);
  }

  // El relleno del gauge necesita 0-100; el score real va de -100 a 100.
  protected readonly gaugeValue = computed(() => {
    const score = this.npsScore();
    return score === null ? 0 : Math.round((score + 100) / 2);
  });

  protected readonly gaugeColor = computed(() => {
    const score = this.npsScore() ?? 0;
    if (score >= 50) return FORMFLOW_SUCCESS;
    if (score >= 0) return FORMFLOW_WARNING;
    return FORMFLOW_ERROR;
  });

  protected readonly series = computed(() => [this.gaugeValue()]);

  protected readonly chart: ApexChart = { type: 'radialBar', height: 220 };

  protected get plotOptions(): ApexPlotOptions {
    const score = this.npsScore();
    return {
      radialBar: {
        hollow: { size: '60%' },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 8,
            formatter: () => (score === null ? '—' : score.toFixed(0)),
            fontSize: '24px',
          },
        },
      },
    };
  }

  protected get colors(): string[] {
    return [this.gaugeColor()];
  }
}
