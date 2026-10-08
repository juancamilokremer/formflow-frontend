export const StorageKeys = {
  LANGUAGE: 'ff_lang',
  THEME: 'ff_theme',
  REFRESH_TOKEN: 'ff_rt',
  TENANT_SLUG: 'ff_ts',
  /** false = just registered, onboarding pending; true = completed or skipped;
   *  absent = pre-existing account from before this feature, never forced into onboarding. */
  ONBOARDING_DONE: 'ff_onboarding_done',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
