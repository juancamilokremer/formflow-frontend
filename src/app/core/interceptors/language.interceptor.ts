import { HttpInterceptorFn } from '@angular/common/http';
import { readStoredLanguage } from '../i18n/stored-language';

// Without this, the backend would resolve messages/emails from the browser's own
// Accept-Language header (OS/browser setting) instead of the language the user actually
// picked in the app — the two are unrelated unless we forward the in-app choice explicitly.
//
// Reads directly from storage rather than injecting TranslateService: the translate loader's
// own HTTP fetch for the JSON translation file goes through this same interceptor, and
// injecting TranslateService here would trigger its construction from inside itself
// (NG0200 circular dependency) on every cold load.
export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ headers: req.headers.set('Accept-Language', readStoredLanguage()) }));
};
