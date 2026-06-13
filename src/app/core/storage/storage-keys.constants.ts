export const StorageKeys = {
  LANGUAGE: 'ff_lang',
  THEME: 'ff_theme',
  REFRESH_TOKEN: 'ff_rt',
  TENANT_SLUG: 'ff_ts',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
