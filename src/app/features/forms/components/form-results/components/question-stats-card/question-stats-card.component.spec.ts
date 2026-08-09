import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { QuestionStatsCardComponent, resolveDisplayMode } from './question-stats-card.component';
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

function distributionsOfLength(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    optionId: `${i}`, label: `${i}`, count: 1, percentage: 100 / n,
  }));
}

describe('resolveDisplayMode', () => {
  it('is "pie" for single with <= 6 options', () => {
    const question = baseQuestion({ type: 'single', distributions: distributionsOfLength(6) });
    expect(resolveDisplayMode(question)).toBe('pie');
  });

  it('is "bar" for single with > 6 options', () => {
    const question = baseQuestion({ type: 'single', distributions: distributionsOfLength(7) });
    expect(resolveDisplayMode(question)).toBe('bar');
  });

  it('is "bar" for multiple regardless of option count', () => {
    const question = baseQuestion({ type: 'multiple', distributions: distributionsOfLength(8) });
    expect(resolveDisplayMode(question)).toBe('bar');
  });

  it.each(['single', 'multiple'])('is "no-options" for %s with an empty distributions array', (type) => {
    const question = baseQuestion({ type, distributions: [] });
    expect(resolveDisplayMode(question)).toBe('no-options');
  });

  it('is "scale" for scale questions even with empty distributions', () => {
    expect(resolveDisplayMode(baseQuestion({ type: 'scale', distributions: [] }))).toBe('scale');
  });

  it('is "nps" for nps questions even with empty distributions', () => {
    expect(resolveDisplayMode(baseQuestion({ type: 'nps', distributions: [] }))).toBe('nps');
  });

  it('is "matrix" for matrix questions', () => {
    expect(resolveDisplayMode(baseQuestion({ type: 'matrix', distributions: [] }))).toBe('matrix');
  });

  it('is "text" for text questions', () => {
    expect(resolveDisplayMode(baseQuestion({ type: 'text', distributions: [] }))).toBe('text');
  });

  it.each(['date', 'file'])('is "no-preview" for %s (only a count is available today)', (type) => {
    expect(resolveDisplayMode(baseQuestion({ type, distributions: [] }))).toBe('no-preview');
  });
});

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

  describe('displayMode', () => {
    it('reflects resolveDisplayMode for the given question', () => {
      const { component } = buildComponent(baseQuestion({ type: 'single', distributions: distributionsOfLength(6) }));
      expect(component['displayMode']()).toBe('pie');
    });
  });
});
