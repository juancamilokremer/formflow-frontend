import { Component, computed, input } from '@angular/core';
import { ApexChart, ApexDataLabels, ApexPlotOptions } from 'ng-apexcharts';
import { ChartComponent } from '../../../../../../shared/components/chart/chart.component';
import { MatrixRowStats } from '../../../../models/form-stats.model';
import { SEQUENTIAL_BLUE_STEPS } from '../chart-colors';

@Component({
  selector: 'app-matrix-heatmap',
  imports: [ChartComponent],
  templateUrl: './matrix-heatmap.component.html',
  styleUrl: './matrix-heatmap.component.scss',
})
export class MatrixHeatmapComponent {
  readonly matrixRows = input.required<MatrixRowStats[]>();

  protected readonly series = computed(() =>
    this.matrixRows().map((row) => ({
      name: row.rowLabel,
      data: row.cells.map((cell) => ({ x: cell.columnLabel, y: Math.round(cell.percentage) })),
    })));

  protected readonly chart = computed<ApexChart>(() => ({
    type: 'heatmap',
    height: Math.max(160, this.matrixRows().length * 50),
  }));

  protected readonly dataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val}%`,
  };

  protected readonly plotOptions: ApexPlotOptions = {
    heatmap: {
      colorScale: {
        ranges: SEQUENTIAL_BLUE_STEPS.map((step, i) => ({
          from: i === 0 ? 0 : SEQUENTIAL_BLUE_STEPS[i - 1].threshold,
          to: step.threshold,
          color: step.color,
        })),
      },
    },
  };
}
