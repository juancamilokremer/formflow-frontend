import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { FormResultsComponent } from './form-results.component';
import { FormsService } from '../../services/forms.service';
import { FormStats, QuestionStats } from '../../models/form-stats.model';

// jsdom doesn't implement ResizeObserver; the Resumen tab renders a real apx-chart.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

const MOCK_STATS: FormStats = {
  formId: 'f1',
  formName: 'Evaluación',
  totalResponses: 5,
  completionRate: 0.8,
  avgResponseTimeSeconds: 90,
  timeline: [{ date: '2026-08-01', count: 5 }],
  questions: [],
};

function question(overrides: Partial<QuestionStats>): QuestionStats {
  return {
    questionId: 'q', title: 'Q', type: 'text', totalResponses: 5, answeredCount: 0,
    distributions: null, average: null, median: null, npsScore: null, matrixRows: null,
    sampleAnswers: [], ...overrides,
  };
}

function buildComponent(overrides: { getStatsImpl?: unknown; stats?: FormStats } = {}) {
  const mockFormsService = {
    getStats: overrides.getStatsImpl ?? vi.fn().mockReturnValue(of(overrides.stats ?? MOCK_STATS)),
  };
  const mockRouter = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    imports: [FormResultsComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: FormsService, useValue: mockFormsService },
      { provide: Router, useValue: mockRouter },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ id: 'f1' }) } },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(FormResultsComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockFormsService, mockRouter };
}

describe('FormResultsComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('loads stats for the form id from the route on init', () => {
    const { component, mockFormsService } = buildComponent();
    expect(mockFormsService.getStats).toHaveBeenCalledWith('f1');
    expect(component['stats']()).toEqual(MOCK_STATS);
    expect(component['loading']()).toBe(false);
  });

  it('sets loadError on failure', () => {
    const { component } = buildComponent({
      getStatsImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
    });
    expect(component['loadError']()).toBe(true);
    expect(component['loading']()).toBe(false);
  });

  describe('setActiveTab', () => {
    it('updates the active tab', () => {
      const { component } = buildComponent();
      component['setActiveTab']('per-question');
      expect(component['activeTab']()).toBe('per-question');
    });
  });

  describe('chartableQuestions', () => {
    it('filters out info blocks — they never collect answers', () => {
      const stats: FormStats = {
        ...MOCK_STATS,
        questions: [
          question({ questionId: 'q1', type: 'info' }),
          question({ questionId: 'q2', type: 'text' }),
        ],
      };
      const { component } = buildComponent({ stats });
      expect(component['chartableQuestions']().map((q) => q.questionId)).toEqual(['q2']);
    });
  });

  describe('goToPreview', () => {
    it('navigates to the form preview path', () => {
      const { component, mockRouter } = buildComponent();
      component['goToPreview']();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'forms', 'f1', 'preview']);
    });
  });
});
