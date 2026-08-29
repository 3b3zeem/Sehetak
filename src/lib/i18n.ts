import enMessages from '@/messages/en.json';
import arMessages from '@/messages/ar.json';

export type Locale = 'en' | 'ar';

export type Messages = typeof enMessages;

const dictionaries: Record<Locale, Messages> = {
  en: enMessages,
  ar: arMessages,
};

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale] || dictionaries.en;
}

/**
 * Nested key lookup, e.g. t('nav.home') or t('dashboard.title')
 */
export function getTranslation(dict: Messages, keyPath: string, fallback = ''): string {
  const keys = keyPath.split('.');
  let current: any = dict;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return fallback || keyPath;
    }
  }
  return typeof current === 'string' ? current : fallback || keyPath;
}
