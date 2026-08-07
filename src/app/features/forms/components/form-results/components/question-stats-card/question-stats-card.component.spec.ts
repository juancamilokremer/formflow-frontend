import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { QuestionStatsCardComponent } from './question-stats-card.component';
import { QuestionStats } from '../../../../models/form-stats.model';

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

function baseQuestion(overrides: Partial<QuestionStats> = {}): QuestionStats {
  return {
    questionId: 'q1',
    title: 'Pregunta',
    type: 'single',
    totalResponses: 10,
    answeredCount: 8,
    distributions: [],
    average: null,
    median: null,
    npsScore: null,
    matrixRows: null,
    sampleAnswers: [],
    ...overrides,
  };
}

function buildComponent(question: QuestionStats) {
  TestBed.configureTestingModule({
    imports: [QuestionStatsCardComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(QuestionStatsCardComponent);
  fixture.componentRef.setInput('question', question);
  fixture.detectChanges();
  return { component: fixture.componentInstance };
}

describe('QuestionStatsCardComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('answeredPct', () => {
    it('computes the rounded percentage of answered over total', () => {
      const { component } = buildComponent(baseQuestion({ answeredCount: 3, totalResponses: 4 }));
      expect(component['answeredPct']()).toBe(75);
    });

    it('is 0 when totalResponses is 0', () => {
      const { component } = buildComponent(baseQuestion({ answeredCount: 0, totalResponses: 0 }));
      expect(component['answeredPct']()).toBe(0);
    });
  });

  describe('chart dispatch', () => {
    it('uses pie for single with <= 6 options', () => {
      const distributions = Array.from({ length: 6 }, (_, i) => ({
        optionId: `${i}`, label: `${i}`, count: 1, percentage: 16.6,
      }));
      const { component } = buildComponent(baseQuestion({ type: 'single', distributions }));
      expect(component['usesPie']()).toBe(true);
      expect(component['usesBar']()).toBe(false);
    });

    it('uses bar for single with > 6 options', () => {
      const distributions = Array.from({ length: 7 }, (_, i) => ({
        optionId: `${i}`, label: `${i}`, count: 1, percentage: 14.3,
      }));
      const { component } = buildComponent(baseQuestion({ type: 'single', distributions }));
      expect(component['usesPie']()).toBe(false);
      expect(component['usesBar']()).toBe(true);
    });

    it('always uses bar for multiple, regardless of option count', () => {
      const { component } = buildComponent(baseQuestion({ type: 'multiple', distributions: [] }));
      expect(component['usesPie']()).toBe(false);
      expect(component['usesBar']()).toBe(true);
    });

    it.each(['scale', 'nps', 'matrix', 'text'])('does not use pie or bar for %s', (type) => {
      const { component } = buildComponent(baseQuestion({ type }));
      expect(component['usesPie']()).toBe(false);
      expect(component['usesBar']()).toBe(false);
    });
  });
});
