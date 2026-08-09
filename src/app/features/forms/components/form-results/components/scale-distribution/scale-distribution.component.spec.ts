import { TestBed } from '@angular/core/testing';
import { ScaleDistributionComponent } from './scale-distribution.component';
import { OptionDistribution } from '../../../../models/form-stats.model';

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

  it('builds a plain count series matched positionally against category labels', () => {
    const { component } = buildComponent();
    expect(component['series']()[0].data).toEqual([1, 2, 3, 3, 1]);
    expect(component['xaxis']().categories).toEqual(['1', '2', '3', '4', '5']);
  });

  it('snaps the average annotation to the nearest category label', () => {
    const { component } = buildComponent(DISTRIBUTIONS, 3.2);
    expect(component['annotations']().xaxis?.[0].x).toBe('3');
  });

  it('keeps the precise average in the annotation label text', () => {
    const { component } = buildComponent(DISTRIBUTIONS, 3.6);
    expect(component['annotations']().xaxis?.[0].x).toBe('4');
    expect(component['annotations']().xaxis?.[0].label?.text).toBe('Promedio: 3.6');
  });

  it('returns no annotations when average is null', () => {
    const { component } = buildComponent(DISTRIBUTIONS, null);
    expect(component['annotations']().xaxis).toBeUndefined();
  });
});
