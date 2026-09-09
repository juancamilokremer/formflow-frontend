import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ConvocatoriaQuestionStatsSectionComponent } from './convocatoria-question-stats-section.component';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { ConvocatoriaQuestionStats } from '../../../../models/convocatoria.model';
import { QuestionStats } from '../../../../../forms/models/form-stats.model';

function questionStats(overrides: Partial<QuestionStats> = {}): QuestionStats {
  return {
    questionId: 'q1', title: 'Pregunta', type: 'single', totalResponses: 2, answeredCount: 2,
    distributions: [], average: null, median: null, npsScore: null, matrixRows: null, sampleAnswers: [],
    ...overrides,
  };
}

const ONE_FORM_STATS: ConvocatoriaQuestionStats = {
  convocatoriaId: 'conv1', convocatoriaName: 'RRHH',
  forms: [{ formId: 'form1', formName: 'Evaluación técnica', totalResponses: 2, questions: [questionStats()] }],
};

const TWO_FORM_STATS: ConvocatoriaQuestionStats = {
  convocatoriaId: 'conv1', convocatoriaName: 'RRHH',
  forms: [
    { formId: 'form1', formName: 'Evaluación técnica', totalResponses: 2, questions: [questionStats({ questionId: 'q1' })] },
    { formId: 'form2', formName: 'Evaluación cultural', totalResponses: 1, questions: [questionStats({ questionId: 'q2' })] },
  ],
};

function buildComponent(overrides: { getQuestionStatsImpl?: unknown } = {}) {
  const mockConvocatoriaService = {
    getQuestionStats: overrides.getQuestionStatsImpl ?? vi.fn().mockReturnValue(of(ONE_FORM_STATS)),
  };

  TestBed.configureTestingModule({
    imports: [ConvocatoriaQuestionStatsSectionComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConvocatoriaQuestionStatsSectionComponent);
  fixture.componentRef.setInput('convocatoriaId', 'conv1');
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockConvocatoriaService };
}

describe('ConvocatoriaQuestionStatsSectionComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('loads the question stats on init and preselects the first form', () => {
    const { component, mockConvocatoriaService } = buildComponent();
    expect(mockConvocatoriaService.getQuestionStats).toHaveBeenCalledWith('conv1');
    expect(component['data']()).toEqual(ONE_FORM_STATS);
    expect(component['selectedFormId']()).toBe('form1');
    expect(component['loading']()).toBe(false);
  });

  it('exposes one option per form and switches the selected form on demand', () => {
    const { component } = buildComponent({ getQuestionStatsImpl: vi.fn().mockReturnValue(of(TWO_FORM_STATS)) });

    expect(component['formOptions']()).toEqual([
      { value: 'form1', label: 'Evaluación técnica' },
      { value: 'form2', label: 'Evaluación cultural' },
    ]);
    expect(component['chartableQuestions']().map((q) => q.questionId)).toEqual(['q1']);

    component['onFormSelected']('form2');

    expect(component['selectedFormId']()).toBe('form2');
    expect(component['chartableQuestions']().map((q) => q.questionId)).toEqual(['q2']);
  });

  it('filters out info questions from the selected form', () => {
    const withInfo: ConvocatoriaQuestionStats = {
      convocatoriaId: 'conv1', convocatoriaName: 'RRHH',
      forms: [{
        formId: 'form1', formName: 'Form', totalResponses: 1,
        questions: [questionStats({ questionId: 'info1', type: 'info' }), questionStats({ questionId: 'q1' })],
      }],
    };
    const { component } = buildComponent({ getQuestionStatsImpl: vi.fn().mockReturnValue(of(withInfo)) });

    expect(component['chartableQuestions']().map((q) => q.questionId)).toEqual(['q1']);
  });

  it('sets loadError on failure', () => {
    const { component } = buildComponent({
      getQuestionStatsImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
    });

    expect(component['loadError']()).toBe(true);
    expect(component['loading']()).toBe(false);
  });

  it('handles a convocatoria with no forms attached without failing', () => {
    const emptyStats: ConvocatoriaQuestionStats = { convocatoriaId: 'conv1', convocatoriaName: 'RRHH', forms: [] };
    const { component } = buildComponent({ getQuestionStatsImpl: vi.fn().mockReturnValue(of(emptyStats)) });

    expect(component['selectedFormId']()).toBeNull();
    expect(component['chartableQuestions']()).toEqual([]);
  });
});
