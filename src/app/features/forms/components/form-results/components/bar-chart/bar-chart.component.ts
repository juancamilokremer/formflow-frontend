import { Component, computed, input } from '@angular/core';
import {
  ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexXAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { OptionDistribution } from '../../../../models/form-stats.model';
import { FORMFLOW_PRIMARY } from '../chart-colors';

const MIN_HEIGHT = 200;
const HEIGHT_PER_BAR = 40;

@Component({
  selector: 'app-bar-chart',
  imports: [NgApexchartsModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent {
  readonly distributions = input.required<OptionDistribution[]>();

  protected readonly series = computed<ApexAxisChartSeries>(() => [{
    name: 'Respuestas',
    data: this.distributions().map((d) => d.count),
  }]);

  protected readonly xaxis = computed<ApexXAxis>(() => ({
    categories: this.distributions().map((d) => d.label),
  }));

  protected readonly chart = computed<ApexChart>(() => ({
    type: 'bar',
    height: Math.max(MIN_HEIGHT, this.distributions().length * HEIGHT_PER_BAR),
    toolbar: { show: false },
  }));

  protected readonly plotOptions: ApexPlotOptions = {
    bar: { horizontal: true, borderRadius: 4, borderRadiusApplication: 'end' },
  };
  protected readonly dataLabels: ApexDataLabels = { enabled: false };
  protected readonly colors: string[] = [FORMFLOW_PRIMARY];
}
