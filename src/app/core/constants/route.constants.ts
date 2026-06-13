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
} as const;

export function publicFormPath(convId: string, token: string): string {
  return `/${RouteConstants.PUBLIC_FORM_PREFIX}/${convId}/${token}`;
}
