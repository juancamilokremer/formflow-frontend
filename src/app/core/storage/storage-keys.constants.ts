export const StorageKeys = {
  LANGUAGE: 'ff_lang',
  THEME: 'ff_theme',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
