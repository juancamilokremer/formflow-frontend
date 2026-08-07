import { TestBed } from '@angular/core/testing';
import { PieChartComponent } from './pie-chart.component';
import { OptionDistribution } from '../../../../models/form-stats.model';

// jsdom doesn't implement ResizeObserver; apx-chart calls it on render.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

const DISTRIBUTIONS: OptionDistribution[] = [
  { optionId: 'a', label: 'Sí', count: 8, percentage: 80 },
  { optionId: 'b', label: 'No', count: 2, percentage: 20 },
];

function buildComponent(distributions = DISTRIBUTIONS) {
  TestBed.configureTestingModule({ imports: [PieChartComponent] }).compileComponents();
  const fixture = TestBed.createComponent(PieChartComponent);
  fixture.componentRef.setInput('distributions', distributions);
  fixture.detectChanges();
  return { component: fixture.componentInstance };
}

describe('PieChartComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('builds the series from the distribution counts', () => {
    const { component } = buildComponent();
    expect(component['series']()).toEqual([8, 2]);
  });

  it('builds the labels from the distribution labels', () => {
    const { component } = buildComponent();
    expect(component['labels']()).toEqual(['Sí', 'No']);
  });

  it('assigns colors by position, not by value', () => {
    const { component } = buildComponent();
    const colors = component['colors']();
    expect(colors[0]).not.toEqual(colors[1]);
    expect(colors).toHaveLength(2);
  });
});
