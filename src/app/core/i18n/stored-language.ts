import { StorageKeys } from '../storage/storage-keys.constants';
import { AppConstants } from '../constants/app.constants';

// Reads the persisted language directly from localStorage, bypassing StorageService/DI on
// purpose — this needs to be safely callable both before the injector exists (app.config.ts's
// provideTranslateService factory) and from the language interceptor, which must NOT inject
// TranslateService itself (that HTTP request is what triggers TranslateService's own
// construction via the translate loader, so injecting it there is a circular dependency —
// NG0200 — on every cold load).
export function readStoredLanguage(): string {
  try {
    const raw = localStorage.getItem(StorageKeys.LANGUAGE);
    return raw ? (JSON.parse(raw) as string) : AppConstants.DEFAULT_LANGUAGE;
  } catch {
    return AppConstants.DEFAULT_LANGUAGE;
  }
}
