export const RouteConstants = {
  HOME: '',
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot-password',
  RESET_PASSWORD: 'reset-password',
  VERIFY_EMAIL: 'verify-email',
  DASHBOARD: 'dashboard',
  FORMS: 'forms',
  CATEGORIES: 'categories',
  CONVOCATORIAS: 'convocatorias',
  ENCUESTAS: 'encuestas',
  BILLING: 'billing',
  SETTINGS: 'settings',
  USERS: 'users',
  TERMS: 'terms',
  PRIVACY: 'privacy',
  PUBLIC_FORM_PREFIX: 'r',
  CONTAINER_FORMS: 'formularios',
  FORM_PREVIEW:  'preview',
  FORM_RESPOND:  'respond',
  FORM_RESULTS:  'results',
  CONVOCATORIA_NEW: 'new',
  QUERY_TAB: 'tab',
} as const;

export function publicFormPath(convId: string, token: string): string {
  return `/${RouteConstants.PUBLIC_FORM_PREFIX}/${convId}/${token}`;
}

/** Every form lives inside an encuesta or a convocatoria, so its routes hang off the container. */
export type ContainerKind = 'encuestas' | 'convocatorias';

function containerFormPath(kind: ContainerKind, containerId: string, formId: string): string[] {
  return ['/', kind, containerId, RouteConstants.CONTAINER_FORMS, formId];
}

export function formBuilderPath(kind: ContainerKind, containerId: string, formId: string): string[] {
  return containerFormPath(kind, containerId, formId);
}

export function formPreviewPath(kind: ContainerKind, containerId: string, formId: string): string[] {
  return [...containerFormPath(kind, containerId, formId), RouteConstants.FORM_PREVIEW];
}

export function formResultsPath(kind: ContainerKind, containerId: string, formId: string): string[] {
  return [...containerFormPath(kind, containerId, formId), RouteConstants.FORM_RESULTS];
}

/** The anonymous respond page is public and form-scoped — it is not part of the admin shell. */
export function formRespondPath(formId: string): string[] {
  return ['/', RouteConstants.FORMS, formId, RouteConstants.FORM_RESPOND];
}

export function convocatoriasListPath(): string[] {
  return ['/', RouteConstants.CONVOCATORIAS];
}

export function convocatoriaNewPath(): string[] {
  return ['/', RouteConstants.CONVOCATORIAS, RouteConstants.CONVOCATORIA_NEW];
}

export function convocatoriaDetailPath(id: string): string[] {
  return ['/', RouteConstants.CONVOCATORIAS, id];
}

export function encuestasListPath(): string[] {
  return ['/', RouteConstants.ENCUESTAS];
}

export function encuestaNewPath(): string[] {
  return ['/', RouteConstants.ENCUESTAS, RouteConstants.CONVOCATORIA_NEW];
}

export function encuestaDetailPath(id: string): string[] {
  return ['/', RouteConstants.ENCUESTAS, id];
}
