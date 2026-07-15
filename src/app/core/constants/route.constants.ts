export const RouteConstants = {
  HOME: '',
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot-password',
  RESET_PASSWORD: 'reset-password',
  VERIFY_EMAIL: 'verify-email',
  DASHBOARD: 'dashboard',
  FORMS: 'forms',
  CONVOCATORIAS: 'convocatorias',
  BILLING: 'billing',
  SETTINGS: 'settings',
  USERS: 'users',
  TERMS: 'terms',
  PRIVACY: 'privacy',
  PUBLIC_FORM_PREFIX: 'r',
  FORM_BUILDER:  'edit',
  FORM_PREVIEW:  'preview',
  FORM_RESPOND:  'respond',
  CONVOCATORIA_NEW: 'nueva',
} as const;

export function publicFormPath(convId: string, token: string): string {
  return `/${RouteConstants.PUBLIC_FORM_PREFIX}/${convId}/${token}`;
}

export function formBuilderPath(formId: string): string[] {
  return [RouteConstants.FORMS, formId, RouteConstants.FORM_BUILDER];
}

export function formPreviewPath(formId: string): string[] {
  return ['/', RouteConstants.FORMS, formId, RouteConstants.FORM_PREVIEW];
}

export function formRespondPath(formId: string): string[] {
  return ['/', RouteConstants.FORMS, formId, RouteConstants.FORM_RESPOND];
}

export function convocatoriaNewPath(): string[] {
  return ['/', RouteConstants.CONVOCATORIAS, RouteConstants.CONVOCATORIA_NEW];
}
