import { Component, computed, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexStroke, ApexDataLabels, ApexGrid,
  ApexMarkers,
} from 'ng-apexcharts';
import { ChartComponent } from '../../../../../../shared/components/chart/chart.component';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { DailyResponseCount } from '../../../../models/form-stats.model';

// Keep in sync manually with --ff-primary in styles.scss — ApexCharts can't
// resolve CSS custom properties when building chart options.
const SERIES_COLOR = '#4F46E5';

@Component({
  selector: 'app-response-timeline',
  imports: [TranslatePipe, ChartComponent, EmptyStateComponent],
  templateUrl: './response-timeline.component.html',
  styleUrl: './response-timeline.component.scss',
})
export class ResponseTimelineComponent {
  private readonly translate = inject(TranslateService);

  // Already filtered server-side by the page-level date range filter (results-filter-bar).
  readonly timeline = input.required<DailyResponseCount[]>();

  protected readonly chartSeries = computed<ApexAxisChartSeries>(() => [{
    name: this.translate.instant('results.summary.total'),
    data: this.timeline().map((entry) => entry.count),
  }]);

  protected readonly chartCategories = computed(() =>
    this.timeline().map((entry) => entry.date));

  protected readonly chart: ApexChart = { type: 'line', height: 240 };
  protected readonly stroke: ApexStroke = { curve: 'smooth', width: 2, colors: [SERIES_COLOR] };
  protected readonly dataLabels: ApexDataLabels = { enabled: false };
  protected readonly grid: ApexGrid = { strokeDashArray: 4 };
  protected readonly colors: string[] = [SERIES_COLOR];
  // Without this, points are invisible until hovered — ApexCharts doesn't draw
  // markers by default on line charts, and a single day of data has no line to
  // draw either (needs 2+ points).
  protected readonly markers: ApexMarkers = { size: 5, strokeWidth: 0, hover: { size: 7 } };

  protected get xaxis(): ApexXAxis {
    return { categories: this.chartCategories() };
  }
}
