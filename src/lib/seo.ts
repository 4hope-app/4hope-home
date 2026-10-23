import type { Metadata } from 'next';
import { links } from '@/data/links';
import { htmlLang, languages, localizePath, t, type Lang } from '@/i18n/utils';

interface PageMeta {
  lang: Lang;
  /** Path without language prefix, e.g. '/' or '/privacy'. Used for canonical + hreflang. */
  path: string;
  title?: string;
  description?: string;
  noindex?: boolean;
}

/** Absolute URL of a localized path on the site. */
export const absoluteUrl = (path: string, lang: Lang): string =>
  new URL(localizePath(path, lang), links.site).href;

/** hreflang map for a path: { 'es-419': ..., en: ..., 'x-default': ... }. */
export function alternateLanguages(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of Object.keys(languages) as Lang[]) map[htmlLang[l]] = absoluteUrl(path, l);
  map['x-default'] = absoluteUrl(path, 'es');
  return map;
}

/** Title, description, canonical, hreflang, Open Graph and Twitter tags for a page. */
export function pageMetadata({
  lang,
  path,
  title,
  description,
  noindex = false,
}: PageMeta): Metadata {
  const d = t(lang);
  const pageTitle = title ? `${title} — 4HOPE` : d.meta.title;
  const pageDescription = description ?? d.meta.description;
  const canonical = absoluteUrl(path, lang);
  // TODO: replace public/og/og-es.png and og-en.png with final artwork (1200×630).
  const ogImage = { url: `/og/og-${lang}.png`, width: 1200, height: 630, alt: d.meta.ogAlt };

  return {
    metadataBase: new URL(links.site),
    title: { absolute: pageTitle },
    description: pageDescription,
    robots: noindex ? { index: false } : undefined,
    alternates: { canonical, languages: alternateLanguages(path) },
    icons: {
      icon: [
        { url: '/icons/favicon.ico', sizes: 'any' },
        { url: '/icons/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
        { url: '/icons/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      ],
      apple: { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    },
    manifest: '/site.webmanifest',
    openGraph: {
      type: 'website',
      siteName: '4HOPE',
      title: pageTitle,
      description: pageDescription,
      url: canonical,
      locale: d.meta.locale,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImage.url],
    },
  };
}

/** JSON for a <script type="application/ld+json">, with `<` escaped so it can't close the tag. */
export const jsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');
