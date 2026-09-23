import esTranslations from '../../../assets/i18n/es.json';
import enTranslations from '../../../assets/i18n/en.json';

// Guards against a Spanish key being added without its English counterpart (or vice versa) —
// without this, ngx-translate silently falls back to showing the raw key string for that locale.
function flattenKeys(obj: unknown, prefix = ''): Set<string> {
  const keys = new Set<string>();
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    keys.add(prefix);
    return keys;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    for (const nested of flattenKeys(value, path)) keys.add(nested);
  }
  return keys;
}

describe('i18n key completeness (es.json vs en.json)', () => {
  it('has the exact same set of leaf keys in both locales', () => {
    const esKeys = flattenKeys(esTranslations);
    const enKeys = flattenKeys(enTranslations);

    const missingInEn = [...esKeys].filter((k) => !enKeys.has(k)).sort();
    const missingInEs = [...enKeys].filter((k) => !esKeys.has(k)).sort();

    expect(missingInEn).toEqual([]);
    expect(missingInEs).toEqual([]);
  });
});
