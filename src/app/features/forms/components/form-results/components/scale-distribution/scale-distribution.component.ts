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

  // Eje de categorías (mismo patrón que BarChartComponent) — un eje numérico con
  // datos {x,y} no renderiza las barras de forma confiable en ApexCharts. La
  // anotación del promedio se snapea a la categoría más cercana (pierde precisión
  // sub-entero en la posición de la línea, pero el label sigue mostrando el valor
  // exacto) a cambio de que las barras sí se vean.
  protected readonly series = computed<ApexAxisChartSeries>(() => [{
    name: 'Respuestas',
    data: this.distributions().map((d) => d.count),
  }]);

  protected readonly xaxis = computed<ApexXAxis>(() => ({
    categories: this.distributions().map((d) => d.label),
  }));

  protected readonly annotations = computed<ApexAnnotations>(() => {
    const avg = this.average();
    if (avg === null) return {};
    const nearestLabel = this.nearestCategoryLabel(avg);
    if (nearestLabel === null) return {};
    return {
      xaxis: [{
        x: nearestLabel,
        borderColor: FORMFLOW_WARNING,
        label: {
          text: `Promedio: ${avg.toFixed(1)}`,
          borderColor: FORMFLOW_WARNING,
          style: { background: FORMFLOW_WARNING, color: '#fff' },
        },
      }],
    };
  });

  private nearestCategoryLabel(avg: number): string | null {
    const distributions = this.distributions();
    if (distributions.length === 0) return null;
    return distributions.reduce((closest, d) =>
      Math.abs(Number(d.label) - avg) < Math.abs(Number(closest.label) - avg) ? d : closest,
    ).label;
  }

  protected readonly chart: ApexChart = { type: 'bar', height: 240, toolbar: { show: false } };
  protected readonly plotOptions: ApexPlotOptions = {
    bar: { borderRadius: 4, borderRadiusApplication: 'end', columnWidth: '50%' },
  };
  protected readonly dataLabels: ApexDataLabels = { enabled: false };
  protected readonly colors: string[] = [FORMFLOW_PRIMARY];
}
