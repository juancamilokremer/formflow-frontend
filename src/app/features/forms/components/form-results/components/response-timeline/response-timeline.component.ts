import { Component, computed, inject, input, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexStroke, ApexDataLabels, ApexGrid,
  ApexMarkers,
} from 'ng-apexcharts';
import { ChartComponent } from '../../../../../../shared/components/chart/chart.component';
import { EmptyStateComponent } from '../../../../../../shared/components/empty-state/empty-state.component';
import { TabItem, TabsComponent } from '../../../../../../shared/components/tabs/tabs.component';
import { DailyResponseCount } from '../../../../models/form-stats.model';

export type TimelineRange = '7d' | '30d' | 'all';

// Keep in sync manually with --ff-primary in styles.scss — ApexCharts can't
// resolve CSS custom properties when building chart options.
const SERIES_COLOR = '#4F46E5';

export function filterTimelineByRange(
  timeline: DailyResponseCount[],
  range: TimelineRange,
  referenceDate: Date = new Date(),
): DailyResponseCount[] {
  if (range === 'all') return timeline;

  const days = range === '7d' ? 7 : 30;
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return timeline.filter((entry) => entry.date >= cutoffStr);
}

@Component({
  selector: 'app-response-timeline',
  imports: [TranslatePipe, ChartComponent, EmptyStateComponent, TabsComponent],
  templateUrl: './response-timeline.component.html',
  styleUrl: './response-timeline.component.scss',
})
export class ResponseTimelineComponent {
  private readonly translate = inject(TranslateService);

  readonly timeline = input.required<DailyResponseCount[]>();

  protected readonly range = signal<TimelineRange>('7d');
  protected readonly rangeOptions: TabItem[] = [
    { id: '7d', label: 'results.range.7d' },
    { id: '30d', label: 'results.range.30d' },
    { id: 'all', label: 'results.range.all' },
  ];

  protected readonly filteredTimeline = computed(() =>
    filterTimelineByRange(this.timeline(), this.range()));

  protected readonly chartSeries = computed<ApexAxisChartSeries>(() => [{
    name: this.translate.instant('results.summary.total'),
    data: this.filteredTimeline().map((entry) => entry.count),
  }]);

  protected readonly chartCategories = computed(() =>
    this.filteredTimeline().map((entry) => entry.date));

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

  protected setRange(rangeId: string): void {
    this.range.set(rangeId as TimelineRange);
  }
}
