import { Component, computed, input } from '@angular/core';
import { ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries } from 'ng-apexcharts';
import { ChartComponent } from '../../../../../../shared/components/chart/chart.component';
import { OptionDistribution } from '../../../../models/form-stats.model';
import { CATEGORICAL_PALETTE } from '../chart-colors';

@Component({
  selector: 'app-pie-chart',
  imports: [ChartComponent],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
})
export class PieChartComponent {
  readonly distributions = input.required<OptionDistribution[]>();

  protected readonly series = computed<ApexNonAxisChartSeries>(() =>
    this.distributions().map((d) => d.count));

  protected readonly labels = computed(() =>
    this.distributions().map((d) => d.label));

  // Fixed order by option position — never reordered by value/count.
  protected readonly colors = computed(() =>
    this.distributions().map((_, i) => CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]));

  protected readonly chart: ApexChart = { type: 'pie', height: 280 };
  protected readonly dataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(0)}%`,
  };
  protected readonly legend: ApexLegend = { position: 'bottom' };
}
