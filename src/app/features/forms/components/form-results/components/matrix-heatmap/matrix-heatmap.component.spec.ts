import { TestBed } from '@angular/core/testing';
import { MatrixHeatmapComponent } from './matrix-heatmap.component';
import { MatrixRowStats } from '../../../../models/form-stats.model';

// jsdom doesn't implement ResizeObserver or SVG getBBox; apx-chart calls both on render.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
const svgTextProto = Object.getPrototypeOf(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
if (typeof svgTextProto.getBBox !== 'function') {
  svgTextProto.getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 });
}

const ROWS: MatrixRowStats[] = [
  {
    rowId: 'r1', rowLabel: 'Comunicación',
    cells: [
      { columnId: 'c1', columnLabel: 'Malo', count: 1, percentage: 10 },
      { columnId: 'c2', columnLabel: 'Bueno', count: 9, percentage: 90 },
    ],
  },
  {
    rowId: 'r2', rowLabel: 'Liderazgo',
    cells: [
      { columnId: 'c1', columnLabel: 'Malo', count: 5, percentage: 50 },
      { columnId: 'c2', columnLabel: 'Bueno', count: 5, percentage: 50 },
    ],
  },
];

function buildComponent(matrixRows = ROWS) {
  TestBed.configureTestingModule({ imports: [MatrixHeatmapComponent] }).compileComponents();
  const fixture = TestBed.createComponent(MatrixHeatmapComponent);
  fixture.componentRef.setInput('matrixRows', matrixRows);
  fixture.detectChanges();
  return { component: fixture.componentInstance };
}

describe('MatrixHeatmapComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('builds one series per row with {x, y} cells from the percentage', () => {
    const { component } = buildComponent();
    expect(component['series']()).toEqual([
      { name: 'Comunicación', data: [{ x: 'Malo', y: 10 }, { x: 'Bueno', y: 90 }] },
      { name: 'Liderazgo', data: [{ x: 'Malo', y: 50 }, { x: 'Bueno', y: 50 }] },
    ]);
  });

  it('scales chart height with the number of rows', () => {
    const manyRows = Array.from({ length: 6 }, (_, i) => ({ ...ROWS[0], rowId: `r${i}` }));
    const { component: many } = buildComponent(manyRows);
    const manyHeight = many['chart']().height as number;
    TestBed.resetTestingModule();

    const { component: oneRow } = buildComponent([ROWS[0]]);
    expect(manyHeight).toBeGreaterThan(oneRow['chart']().height as number);
  });

  it('builds contiguous, non-overlapping color scale ranges covering 0-100', () => {
    const { component } = buildComponent();
    const ranges = component['plotOptions'].heatmap!.colorScale!.ranges!;
    expect(ranges[0].from).toBe(0);
    expect(ranges[ranges.length - 1].to).toBe(100);
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i].from).toBe(ranges[i - 1].to);
    }
  });
});
