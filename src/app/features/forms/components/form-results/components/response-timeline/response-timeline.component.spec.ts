import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ResponseTimelineComponent, filterTimelineByRange } from './response-timeline.component';
import { DailyResponseCount } from '../../../../models/form-stats.model';

// jsdom doesn't implement ResizeObserver; apx-chart calls it on render.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

const TIMELINE: DailyResponseCount[] = [
  { date: '2026-07-01', count: 1 },
  { date: '2026-07-20', count: 2 },
  { date: '2026-08-01', count: 3 },
  { date: '2026-08-06', count: 4 },
];

const REFERENCE_DATE = new Date('2026-08-06T12:00:00Z');

describe('filterTimelineByRange', () => {
  it('returns everything for range "all"', () => {
    expect(filterTimelineByRange(TIMELINE, 'all', REFERENCE_DATE)).toEqual(TIMELINE);
  });

  it('keeps only the last 7 days (inclusive) for range "7d"', () => {
    const result = filterTimelineByRange(TIMELINE, '7d', REFERENCE_DATE);
    expect(result.map((e) => e.date)).toEqual(['2026-08-01', '2026-08-06']);
  });

  it('keeps only the last 30 days (inclusive) for range "30d"', () => {
    const result = filterTimelineByRange(TIMELINE, '30d', REFERENCE_DATE);
    expect(result.map((e) => e.date)).toEqual(['2026-07-20', '2026-08-01', '2026-08-06']);
  });

  it('returns an empty array when nothing falls in range', () => {
    const result = filterTimelineByRange([{ date: '2026-01-01', count: 1 }], '7d', REFERENCE_DATE);
    expect(result).toEqual([]);
  });
});

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

  describe('setRange', () => {
    it('updates the active range signal', () => {
      const { component } = buildComponent();
      component['setRange']('30d');
      expect(component['range']()).toBe('30d');
    });
  });

  describe('chartCategories', () => {
    it('reflects the dates of the currently filtered timeline', () => {
      const { component } = buildComponent();
      component['setRange']('all');
      expect(component['chartCategories']()).toEqual(TIMELINE.map((e) => e.date));
    });
  });

  describe('chartSeries', () => {
    it('builds a single series with the counts of the filtered timeline', () => {
      const { component } = buildComponent();
      component['setRange']('all');
      expect(component['chartSeries']()[0].data).toEqual(TIMELINE.map((e) => e.count));
    });
  });
});
