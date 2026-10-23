/**
 * The <html> shell shared by both root layouts (es, en) and the global 404:
 * theme, global styles, font preloads, Organization JSON-LD, analytics and the skip link.
 * Per-page <title>, canonical, hreflang and OG tags come from each page's `metadata`.
 */
import '../../styles/fonts.css';
import '../../styles/tokens.css';
import '../../styles/global.css';
import '../../styles/islands.css';
import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import AuthProvider from '../AuthProvider';
import { links, socials } from '@/data/links';
import { htmlLang, t, type Lang } from '@/i18n/utils';
import { jsonLd } from '@/lib/seo';

interface Props {
  lang: Lang;
  children: ReactNode;
}

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC;

export default function Document({ lang, children }: Props) {
  const d = t(lang);
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '4HOPE',
    url: links.site,
    logo: new URL('/brand/logo.png', links.site).href,
    description: d.meta.description,
    areaServed: 'Latin America',
    sameAs: socials.filter((s) => s.ready).map((s) => s.href),
  };

  for (const font of ['/fonts/archivo-latin-wght.woff2', '/fonts/inter-latin-wght.woff2']) {
    preload(font, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  }

  return (
    <html lang={htmlLang[lang]} data-theme="arena">
      {/* App Router root layouts render <head> directly; next/head is Pages Router only. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organization) }}
        />
        {plausibleDomain && (
          <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" />
        )}
        {!plausibleDomain && umamiId && umamiSrc && (
          <script defer data-website-id={umamiId} src={umamiSrc} />
        )}
      </head>
      <body>
        <AuthProvider>
          <a className="skip-link" href="#main">
            {d.a11y.skip}
          </a>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
