import { Component, computed, input } from '@angular/core';
import {
  ApexAnnotations, ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexGrid,
  ApexLegend, ApexMarkers, ApexNonAxisChartSeries, ApexPlotOptions, ApexStroke,
  ApexXAxis, NgApexchartsModule,
} from 'ng-apexcharts';

// Thin wrapper around <apx-chart> so every chart in the app shares the same
// baseline options (e.g. hiding the built-in toolbar) instead of repeating them
// in each chart-type component. Callers only need to pass what makes their chart
// different (series, type-specific plotOptions, etc.).
@Component({
  selector: 'app-chart',
  imports: [NgApexchartsModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent {
  readonly chart = input.required<ApexChart>();
  readonly series = input<ApexAxisChartSeries | ApexNonAxisChartSeries>([]);
  readonly xaxis = input<ApexXAxis>({});
  readonly labels = input<string[]>([]);
  readonly colors = input<string[]>([]);
  readonly dataLabels = input<ApexDataLabels>({});
  readonly stroke = input<ApexStroke>({});
  readonly grid = input<ApexGrid>({});
  readonly markers = input<ApexMarkers>({});
  readonly plotOptions = input<ApexPlotOptions>({});
  readonly legend = input<ApexLegend>({});
  readonly annotations = input<ApexAnnotations>({});

  protected readonly mergedChart = computed<ApexChart>(() => ({
    toolbar: { show: false },
    ...this.chart(),
  }));
}
