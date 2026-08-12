import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ResponseTimelineComponent } from './response-timeline.component';
import { DailyResponseCount } from '../../../../models/form-stats.model';

// jsdom doesn't implement ResizeObserver; apx-chart calls it on render.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

const TIMELINE: DailyResponseCount[] = [
  { date: '2026-08-01', count: 3 },
  { date: '2026-08-06', count: 4 },
];

function buildComponent(timeline: DailyResponseCount[] = TIMELINE) {
  TestBed.configureTestingModule({
    imports: [ResponseTimelineComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(ResponseTimelineComponent);
  fixture.componentRef.setInput('timeline', timeline);
  fixture.detectChanges();
  return { component: fixture.componentInstance };
}

describe('ResponseTimelineComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('chartCategories', () => {
    it('reflects the dates of the timeline input as-is', () => {
      const { component } = buildComponent();
      expect(component['chartCategories']()).toEqual(TIMELINE.map((e) => e.date));
    });
  });

  describe('chartSeries', () => {
    it('builds a single series with the counts of the timeline input', () => {
      const { component } = buildComponent();
      expect(component['chartSeries']()[0].data).toEqual(TIMELINE.map((e) => e.count));
    });
  });
});
