import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { OnboardingService } from './onboarding.service';
import { ConvocatoriaService } from '../../convocatorias/services/convocatoria.service';
import { FormsService } from '../../forms/services/forms.service';
import { ConvocatoriaDetail, ConvocatoriaForm } from '../../convocatorias/models/convocatoria.model';
import { FormSection } from '../../forms/models/form.model';
import { CreatedOnboardingForm, ONBOARDING_TEMPLATES, OnboardingTemplate } from '../models/onboarding.model';

const CONVOCATORIA_DETAIL = { id: 'conv-1' } as ConvocatoriaDetail;
const CONVOCATORIA_FORM = { id: 'cf-1', formId: 'form-1' } as ConvocatoriaForm;
const SECTION = { id: 'section-1' } as FormSection;

function setup() {
  const mockConvocatoriaService = {
    create: vi.fn().mockReturnValue(of(CONVOCATORIA_DETAIL)),
    createForm: vi.fn().mockReturnValue(of(CONVOCATORIA_FORM)),
  };
  const mockFormsService = {
    createSection: vi.fn().mockReturnValue(of(SECTION)),
    addQuestion: vi.fn().mockReturnValue(of({})),
  };

  TestBed.configureTestingModule({
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
      { provide: FormsService, useValue: mockFormsService },
    ],
  });

  return {
    service: TestBed.inject(OnboardingService),
    mockConvocatoriaService,
    mockFormsService,
  };
}

/** Every mocked call returns `of(...)`, which emits synchronously — no need for async/done. */
function resultOf(observable: { subscribe: (fn: (value: CreatedOnboardingForm) => void) => void }): CreatedOnboardingForm {
  let result!: CreatedOnboardingForm;
  observable.subscribe((value) => (result = value));
  return result;
}

describe('OnboardingService', () => {
  it('creates the container, the form, a section and every question for a template', () => {
    const { service, mockConvocatoriaService, mockFormsService } = setup();
    const template = ONBOARDING_TEMPLATES.find((t) => t.id === 'diagnostic')!;

    const result = resultOf(service.createFromTemplate(template));

    expect(mockConvocatoriaService.create).toHaveBeenCalledWith({ name: template.nameKey, type: 'DIAGNOSTIC' });
    expect(mockConvocatoriaService.createForm).toHaveBeenCalledWith('conv-1', {
      name: template.nameKey, type: 'DIAGNOSTIC', weight: 100, categoryWeights: [], minScore: null,
    });
    expect(mockFormsService.createSection).toHaveBeenCalledWith('form-1', {
      title: 'onboarding.template.default_section_title',
    });
    expect(mockFormsService.addQuestion).toHaveBeenCalledTimes(template.questions.length);
    expect(result).toEqual({ containerId: 'conv-1', containerKind: 'convocatorias', formId: 'form-1' });

    // First diagnostic question is a scale type — assert the resolved AddQuestionRequest shape.
    const [, , firstRequest] = mockFormsService.addQuestion.mock.calls[0];
    expect(firstRequest.type).toBe('scale');
    expect(firstRequest.title).toBe('onboarding.templates.diagnostic.questions.communication.title');
    expect(firstRequest.config).toEqual({
      min: 1, max: 5,
      minLabel: 'onboarding.templates.diagnostic.scale.min_label',
      maxLabel: 'onboarding.templates.diagnostic.scale.max_label',
      scoringType: 'none',
    });
  });

  it('resolves a single-choice question into real options with generated ids', () => {
    const { service, mockFormsService } = setup();
    const template = ONBOARDING_TEMPLATES.find((t) => t.id === 'candidates')!;

    resultOf(service.createFromTemplate(template));

    const [, , firstRequest] = mockFormsService.addQuestion.mock.calls[0];
    expect(firstRequest.type).toBe('single');
    expect(firstRequest.config.scoringType).toBe('none');
    expect(firstRequest.config.options).toHaveLength(4);
    expect(firstRequest.config.options[0]).toEqual({
      id: expect.any(String),
      label: 'onboarding.templates.candidates.questions.experience.options.under_1',
    });
  });

  it('routes a REGISTRATION template through /encuestas', () => {
    const { service } = setup();
    const template = ONBOARDING_TEMPLATES.find((t) => t.id === 'registration')!;

    const result = resultOf(service.createFromTemplate(template));

    expect(result.containerKind).toBe('encuestas');
  });

  it('skips section/question creation for a template with no questions', () => {
    const { service, mockFormsService } = setup();
    const emptyTemplate: OnboardingTemplate = {
      id: 'empty', type: 'REGISTRATION', nameKey: 'x', descriptionKey: 'y', questions: [],
    };

    const result = resultOf(service.createFromTemplate(emptyTemplate));

    expect(mockFormsService.createSection).not.toHaveBeenCalled();
    expect(mockFormsService.addQuestion).not.toHaveBeenCalled();
    expect(result).toEqual({ containerId: 'conv-1', containerKind: 'encuestas', formId: 'form-1' });
  });

  it('creates a blank container+form without touching sections/questions', () => {
    const { service, mockConvocatoriaService, mockFormsService } = setup();

    const result = resultOf(service.createBlank('CANDIDATES', 'Mi primer formulario'));

    expect(mockConvocatoriaService.create).toHaveBeenCalledWith({ name: 'Mi primer formulario', type: 'CANDIDATES' });
    expect(mockFormsService.createSection).not.toHaveBeenCalled();
    expect(result.containerKind).toBe('convocatorias');
  });
});
