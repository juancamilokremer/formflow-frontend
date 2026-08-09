import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { NpsScoreComponent, computeNpsBreakdown } from './nps-score.component';
import { OptionDistribution } from '../../../../models/form-stats.model';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

function distributionsFrom(counts: Record<number, number>): OptionDistribution[] {
  return Array.from({ length: 11 }, (_, v) => ({
    optionId: String(v), label: String(v), count: counts[v] ?? 0, percentage: 0,
  }));
}

describe('computeNpsBreakdown', () => {
  it('buckets 9-10 as promoters, 7-8 as passives, 0-6 as detractors', () => {
    const distributions = distributionsFrom({ 10: 2, 9: 1, 8: 3, 7: 1, 6: 4, 0: 1 });
    expect(computeNpsBreakdown(distributions)).toEqual({ promoters: 3, passives: 4, detractors: 5 });
  });

  it('returns all zeros when there are no answers', () => {
    expect(computeNpsBreakdown(distributionsFrom({}))).toEqual({ promoters: 0, passives: 0, detractors: 0 });
  });
});

function buildComponent(npsScore: number | null, counts: Record<number, number>) {
  TestBed.configureTestingModule({
    imports: [NpsScoreComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(NpsScoreComponent);
  fixture.componentRef.setInput('npsScore', npsScore);
  fixture.componentRef.setInput('distributions', distributionsFrom(counts));
  fixture.detectChanges();
  return { component: fixture.componentInstance };
}

describe('NpsScoreComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('normalizes npsScore from [-100,100] to a [0,100] gauge value', () => {
    const { component } = buildComponent(50, { 10: 1 });
    expect(component['gaugeValue']()).toBe(75);
  });

  it('computes percentages per bucket over the total answered', () => {
    const { component } = buildComponent(0, { 10: 5, 8: 3, 2: 2 });
    expect(component['promotersPct']()).toBe(50);
    expect(component['passivesPct']()).toBe(30);
    expect(component['detractorsPct']()).toBe(20);
  });

  describe('gaugeColor', () => {
    it('is success for scores >= 50', () => {
      const { component } = buildComponent(60, { 10: 1 });
      expect(component['gaugeColor']()).toBe('#15803D');
    });

    it('is warning for scores between 0 and 49', () => {
      const { component } = buildComponent(20, { 9: 1 });
      expect(component['gaugeColor']()).toBe('#854D0E');
    });

    it('is error for negative scores', () => {
      const { component } = buildComponent(-30, { 1: 1 });
      expect(component['gaugeColor']()).toBe('#EF4444');
    });
  });
});
