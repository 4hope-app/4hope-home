import Document from '@/components/layout/Document';
import NotFoundPage from '@/components/pages/NotFoundPage';
import { pageMetadata } from '@/lib/seo';
import { t } from '@/i18n/utils';
export { viewport } from '@/lib/viewport';

export const metadata = pageMetadata({
  lang: 'es',
  path: '/404',
  title: t('es').notFound.title,
  // No `noindex` here: Next.js already adds <meta name="robots" content="noindex"> to 404s.
});

/** 404 for every unmatched URL (both languages share it). */
export default function GlobalNotFound() {
  return (
    <Document lang="es">
      <NotFoundPage />
    </Document>
  );
}
