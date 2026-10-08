import { ProcessType } from '../../convocatorias/models/convocatoria.model';
import { ContainerKind } from '../../../core/constants/route.constants';

export type OnboardingStepId = 'welcome' | 'company' | 'template' | 'share';

export const ONBOARDING_STEP_IDS: OnboardingStepId[] = ['welcome', 'company', 'template', 'share'];

export interface CreatedOnboardingForm {
  containerId: string;
  containerKind: ContainerKind;
  formId: string;
}

export interface OnboardingTextQuestion {
  type: 'text';
  titleKey: string;
  required: boolean;
}

export interface OnboardingSingleQuestion {
  type: 'single';
  titleKey: string;
  required: boolean;
  optionLabelKeys: string[];
}

export interface OnboardingScaleQuestion {
  type: 'scale';
  titleKey: string;
  required: boolean;
}

/** Everything the templates below need to build an AddQuestionRequest — all text as
 *  i18n keys, resolved by OnboardingService at creation time, never as literal strings. */
export type OnboardingQuestion = OnboardingTextQuestion | OnboardingSingleQuestion | OnboardingScaleQuestion;

export interface OnboardingTemplate {
  id: string;
  type: ProcessType;
  /** Also used as the default container name sent to the API — same text
   *  shown on the template card; the user can rename it right after creation. */
  nameKey: string;
  descriptionKey: string;
  questions: OnboardingQuestion[];
}

function textQuestion(titleKey: string, required: boolean): OnboardingTextQuestion {
  return { type: 'text', titleKey, required };
}

function singleQuestion(titleKey: string, optionLabelKeys: string[]): OnboardingSingleQuestion {
  return { type: 'single', titleKey, required: true, optionLabelKeys };
}

function scaleQuestion(titleKey: string): OnboardingScaleQuestion {
  return { type: 'scale', titleKey, required: true };
}

const CANDIDATES_TEMPLATE: OnboardingTemplate = {
  id: 'candidates',
  type: 'CANDIDATES',
  nameKey: 'onboarding.templates.candidates.name',
  descriptionKey: 'onboarding.templates.candidates.description',
  questions: [
    singleQuestion('onboarding.templates.candidates.questions.experience.title', [
      'onboarding.templates.candidates.questions.experience.options.under_1',
      'onboarding.templates.candidates.questions.experience.options.one_to_two',
      'onboarding.templates.candidates.questions.experience.options.three_to_five',
      'onboarding.templates.candidates.questions.experience.options.over_five',
    ]),
    singleQuestion('onboarding.templates.candidates.questions.education.title', [
      'onboarding.templates.candidates.questions.education.options.high_school',
      'onboarding.templates.candidates.questions.education.options.technical',
      'onboarding.templates.candidates.questions.education.options.professional',
      'onboarding.templates.candidates.questions.education.options.postgraduate',
    ]),
    textQuestion('onboarding.templates.candidates.questions.salary_expectation.title', false),
    singleQuestion('onboarding.templates.candidates.questions.availability.title', [
      'onboarding.templates.candidates.questions.availability.options.immediate',
      'onboarding.templates.candidates.questions.availability.options.two_weeks',
      'onboarding.templates.candidates.questions.availability.options.one_month',
      'onboarding.templates.candidates.questions.availability.options.over_one_month',
    ]),
    textQuestion('onboarding.templates.candidates.questions.motivation.title', false),
  ],
};

const DIAGNOSTIC_TEMPLATE: OnboardingTemplate = {
  id: 'diagnostic',
  type: 'DIAGNOSTIC',
  nameKey: 'onboarding.templates.diagnostic.name',
  descriptionKey: 'onboarding.templates.diagnostic.description',
  questions: [
    'communication', 'information', 'feedback', 'trust',
    'environment', 'recognition', 'compensation', 'benefits',
  ].map((id) => scaleQuestion(`onboarding.templates.diagnostic.questions.${id}.title`)),
};

const REGISTRATION_TEMPLATE: OnboardingTemplate = {
  id: 'registration',
  type: 'REGISTRATION',
  nameKey: 'onboarding.templates.registration.name',
  descriptionKey: 'onboarding.templates.registration.description',
  questions: [
    textQuestion('onboarding.templates.registration.questions.full_name.title', true),
    textQuestion('onboarding.templates.registration.questions.email.title', true),
    textQuestion('onboarding.templates.registration.questions.position.title', false),
    textQuestion('onboarding.templates.registration.questions.company.title', false),
  ],
};

export const ONBOARDING_TEMPLATES: OnboardingTemplate[] = [
  CANDIDATES_TEMPLATE,
  DIAGNOSTIC_TEMPLATE,
  REGISTRATION_TEMPLATE,
];
