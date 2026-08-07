import { TestBed } from '@angular/core/testing';
import { ScaleDistributionComponent } from './scale-distribution.component';
import { OptionDistribution } from '../../../../models/form-stats.model';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

const DISTRIBUTIONS: OptionDistribution[] = [
  { optionId: '1', label: '1', count: 1, percentage: 10 },
  { optionId: '2', label: '2', count: 2, percentage: 20 },
  { optionId: '3', label: '3', count: 3, percentage: 30 },
  { optionId: '4', label: '4', count: 3, percentage: 30 },
  { optionId: '5', label: '5', count: 1, percentage: 10 },
];

function buildComponent(distributions = DISTRIBUTIONS, average: number | null = 3.2) {
  TestBed.configureTestingModule({ imports: [ScaleDistributionComponent] }).compileComponents();
  const fixture = TestBed.createComponent(ScaleDistributionComponent);
  fixture.componentRef.setInput('distributions', distributions);
  fixture.componentRef.setInput('average', average);
  fixture.detectChanges();
  return { component: fixture.componentInstance };
}

describe('ScaleDistributionComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('builds numeric {x, y} points from the distributions', () => {
    const { component } = buildComponent();
    expect(component['series']()[0].data).toEqual([
      { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 1 },
    ]);
  });

  it('places the average annotation at the exact fractional x position', () => {
    const { component } = buildComponent();
    expect(component['annotations']().xaxis?.[0].x).toBe(3.2);
  });

  it('returns no annotations when average is null', () => {
    const { component } = buildComponent(DISTRIBUTIONS, null);
    expect(component['annotations']().xaxis).toBeUndefined();
  });
});
