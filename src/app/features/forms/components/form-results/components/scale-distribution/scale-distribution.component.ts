import { Component, computed, input } from '@angular/core';
import {
  ApexAnnotations, ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions,
  ApexXAxis, NgApexchartsModule,
} from 'ng-apexcharts';
import { OptionDistribution } from '../../../../models/form-stats.model';
import { FORMFLOW_PRIMARY, FORMFLOW_WARNING } from '../chart-colors';

@Component({
  selector: 'app-scale-distribution',
  imports: [NgApexchartsModule],
  templateUrl: './scale-distribution.component.html',
  styleUrl: './scale-distribution.component.scss',
})
export class ScaleDistributionComponent {
  readonly distributions = input.required<OptionDistribution[]>();
  readonly average = input<number | null>(null);

  // El eje debe ser numérico (no de categorías) para que la anotación del promedio
  // se ubique en su posición fraccionaria real, no en la categoría más cercana.
  protected readonly series = computed<ApexAxisChartSeries>(() => [{
    name: 'Respuestas',
    data: this.distributions().map((d) => ({ x: Number(d.label), y: d.count })),
  }]);

  protected readonly xaxis = computed<ApexXAxis>(() => ({
    type: 'numeric',
    tickAmount: this.distributions().length - 1,
    labels: { formatter: (val: string) => Math.round(Number(val)).toString() },
  }));

  protected readonly annotations = computed<ApexAnnotations>(() => {
    const avg = this.average();
    if (avg === null) return {};
    return {
      xaxis: [{
        x: avg,
        borderColor: FORMFLOW_WARNING,
        label: {
          text: `Promedio: ${avg.toFixed(1)}`,
          borderColor: FORMFLOW_WARNING,
          style: { background: FORMFLOW_WARNING, color: '#fff' },
        },
      }],
    };
  });

  protected readonly chart: ApexChart = { type: 'bar', height: 240, toolbar: { show: false } };
  protected readonly plotOptions: ApexPlotOptions = {
    bar: { borderRadius: 4, borderRadiusApplication: 'end', columnWidth: '50%' },
  };
  protected readonly dataLabels: ApexDataLabels = { enabled: false };
  protected readonly colors: string[] = [FORMFLOW_PRIMARY];
}
