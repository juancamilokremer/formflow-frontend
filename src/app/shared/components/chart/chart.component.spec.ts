import { TestBed } from '@angular/core/testing';
import { ChartComponent } from './chart.component';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

function buildComponent(chart: { type: string; height?: number; toolbar?: { show: boolean } }) {
  TestBed.configureTestingModule({ imports: [ChartComponent] }).compileComponents();
  const fixture = TestBed.createComponent(ChartComponent);
  fixture.componentRef.setInput('chart', chart);
  fixture.detectChanges();
  return { component: fixture.componentInstance };
}

describe('ChartComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('mergedChart', () => {
    it('hides the toolbar by default', () => {
      const { component } = buildComponent({ type: 'bar', height: 200 });
      expect(component['mergedChart']().toolbar?.show).toBe(false);
    });

    it('lets the caller override the toolbar', () => {
      const { component } = buildComponent({ type: 'bar', height: 200, toolbar: { show: true } });
      expect(component['mergedChart']().toolbar?.show).toBe(true);
    });

    it('keeps the rest of the caller-provided chart options', () => {
      const { component } = buildComponent({ type: 'pie', height: 280 });
      expect(component['mergedChart']().type).toBe('pie');
      expect(component['mergedChart']().height).toBe(280);
    });
  });
});
