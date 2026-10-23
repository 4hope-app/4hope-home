import es from './es.json';
import en from './en.json';

export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';

export type Dictionary = typeof es;
const dictionaries: Record<Lang, Dictionary> = { es, en };

/** BCP 47 tags for <html lang> and hreflang. Spanish targets Latin America. */
export const htmlLang: Record<Lang, string> = { es: 'es-419', en: 'en' };

/** Returns the dictionary for a language: `const d = t(lang); d.hero.headline`. */
export function t(lang: Lang): Dictionary {
  return dictionaries[lang];
}

/** Localized internal path: localizePath('/privacy', 'en') -> '/en/privacy'. */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}
