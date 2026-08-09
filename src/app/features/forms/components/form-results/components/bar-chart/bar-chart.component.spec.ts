import { TestBed } from '@angular/core/testing';
import { BarChartComponent } from './bar-chart.component';
import { OptionDistribution } from '../../../../models/form-stats.model';

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

const DISTRIBUTIONS: OptionDistribution[] = [
  { optionId: 'a', label: 'Opción A', count: 3, percentage: 30 },
  { optionId: 'b', label: 'Opción B', count: 7, percentage: 70 },
];

function buildComponent(distributions = DISTRIBUTIONS) {
  TestBed.configureTestingModule({ imports: [BarChartComponent] }).compileComponents();
  const fixture = TestBed.createComponent(BarChartComponent);
  fixture.componentRef.setInput('distributions', distributions);
  fixture.detectChanges();
  return { component: fixture.componentInstance };
}

describe('BarChartComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('builds a single series from the distribution counts', () => {
    const { component } = buildComponent();
    expect(component['series']()).toEqual([{ name: 'Respuestas', data: [3, 7] }]);
  });

  it('builds xaxis categories from the distribution labels', () => {
    const { component } = buildComponent();
    expect(component['xaxis']().categories).toEqual(['Opción A', 'Opción B']);
  });

  it('scales chart height with the number of bars', () => {
    const { component: fewBars } = buildComponent(DISTRIBUTIONS);
    const fewBarsHeight = fewBars['chart']().height as number;
    TestBed.resetTestingModule();

    const manyDistributions = Array.from({ length: 10 }, (_, i) => ({
      optionId: `o${i}`, label: `Opción ${i}`, count: 1, percentage: 10,
    }));
    const { component: manyBars } = buildComponent(manyDistributions);

    expect(manyBars['chart']().height).toBeGreaterThan(fewBarsHeight);
  });
});
