import { ProcessType } from '../../convocatorias/models/convocatoria.model';
import { AddQuestionRequest } from '../../forms/models/form.model';

export type OnboardingStepId = 'welcome' | 'company' | 'template' | 'share';

export const ONBOARDING_STEP_IDS: OnboardingStepId[] = ['welcome', 'company', 'template', 'share'];

export interface OnboardingTemplate {
  id: string;
  type: ProcessType;
  nameKey: string;
  descriptionKey: string;
  /** Container name sent to the API — plain Spanish text, same as any other
   *  convocatoria/encuesta name; the user can rename it right after creation. */
  defaultName: string;
  questions: AddQuestionRequest[];
}

function singleOption(label: string): { id: string; label: string } {
  return { id: crypto.randomUUID(), label };
}

const CANDIDATES_TEMPLATE: OnboardingTemplate = {
  id: 'candidates',
  type: 'CANDIDATES',
  nameKey: 'onboarding.templates.candidates.name',
  descriptionKey: 'onboarding.templates.candidates.description',
  defaultName: 'Evaluación de candidatos',
  questions: [
    {
      type: 'single',
      title: '¿Cuántos años de experiencia tienes en este campo?',
      required: true,
      config: {
        scoringType: 'none',
        options: [
          singleOption('Menos de 1 año'),
          singleOption('1-2 años'),
          singleOption('3-5 años'),
          singleOption('Más de 5 años'),
        ],
      },
    },
    {
      type: 'single',
      title: '¿Cuál es tu nivel de formación más alto?',
      required: true,
      config: {
        scoringType: 'none',
        options: [
          singleOption('Bachillerato'),
          singleOption('Técnico/Tecnólogo'),
          singleOption('Profesional'),
          singleOption('Posgrado'),
        ],
      },
    },
    { type: 'text', title: 'Cuéntanos tus expectativas salariales', required: false, config: { placeholder: '' } },
    {
      type: 'single',
      title: '¿Cuál es tu disponibilidad para iniciar?',
      required: true,
      config: {
        scoringType: 'none',
        options: [
          singleOption('Inmediata'),
          singleOption('2 semanas'),
          singleOption('1 mes'),
          singleOption('Más de 1 mes'),
        ],
      },
    },
    { type: 'text', title: '¿Qué te motiva a postularte a esta posición?', required: false, config: { placeholder: '' } },
  ],
};

const LIKERT_CONFIG = { min: 1, max: 5, minLabel: 'Muy en desacuerdo', maxLabel: 'Muy de acuerdo', scoringType: 'none' };

const DIAGNOSTIC_TEMPLATE: OnboardingTemplate = {
  id: 'diagnostic',
  type: 'DIAGNOSTIC',
  nameKey: 'onboarding.templates.diagnostic.name',
  descriptionKey: 'onboarding.templates.diagnostic.description',
  defaultName: 'Diagnóstico de clima laboral',
  questions: [
    'La comunicación dentro de mi equipo es clara y efectiva',
    'Recibo la información que necesito para hacer bien mi trabajo',
    'Mi líder directo me brinda retroalimentación útil',
    'Confío en las decisiones que toma el liderazgo de la empresa',
    'El ambiente de trabajo es positivo y colaborativo',
    'Me siento valorado como miembro del equipo',
    'Mi compensación es justa en relación con mis responsabilidades',
    'Los beneficios que recibo satisfacen mis necesidades',
  ].map((title) => ({ type: 'scale' as const, title, required: true, config: { ...LIKERT_CONFIG } })),
};

const REGISTRATION_TEMPLATE: OnboardingTemplate = {
  id: 'registration',
  type: 'REGISTRATION',
  nameKey: 'onboarding.templates.registration.name',
  descriptionKey: 'onboarding.templates.registration.description',
  defaultName: 'Formulario de registro',
  questions: [
    { type: 'text', title: 'Nombre completo', required: true, config: { placeholder: '' } },
    { type: 'text', title: 'Correo electrónico', required: true, config: { placeholder: '' } },
    { type: 'text', title: 'Cargo', required: false, config: { placeholder: '' } },
    { type: 'text', title: 'Empresa', required: false, config: { placeholder: '' } },
  ],
};

export const ONBOARDING_TEMPLATES: OnboardingTemplate[] = [
  CANDIDATES_TEMPLATE,
  DIAGNOSTIC_TEMPLATE,
  REGISTRATION_TEMPLATE,
];
