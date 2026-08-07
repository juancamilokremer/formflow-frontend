import { Component, computed, input } from '@angular/core';
import { ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries, NgApexchartsModule } from 'ng-apexcharts';
import { OptionDistribution } from '../../../../models/form-stats.model';
import { CATEGORICAL_PALETTE } from '../chart-colors';

@Component({
  selector: 'app-pie-chart',
  imports: [NgApexchartsModule],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
})
export class PieChartComponent {
  readonly distributions = input.required<OptionDistribution[]>();

  protected readonly series = computed<ApexNonAxisChartSeries>(() =>
    this.distributions().map((d) => d.count));

  protected readonly labels = computed(() =>
    this.distributions().map((d) => d.label));

  // Orden fijo por posición de la opción — nunca reordenado por valor/conteo.
  protected readonly colors = computed(() =>
    this.distributions().map((_, i) => CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]));

  protected readonly chart: ApexChart = { type: 'pie', height: 280 };
  protected readonly dataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(0)}%`,
  };
  protected readonly legend: ApexLegend = { position: 'bottom' };
}
