/** Privacy page, shared by /privacy (es) and /en/privacy (en). */
import LegalDocument from './LegalDocument';
import { t, type Lang } from '@/i18n/utils';
import { pageMetadata } from '@/lib/seo';

interface Props {
  lang: Lang;
}

// TODO: set the real "last updated" date when the policy is reviewed.
const updated = '2026-10-21';

export const privacyMetadata = (lang: Lang) => {
  const p = t(lang).privacy;
  return pageMetadata({ lang, path: '/privacy', title: p.title, description: p.metaDescription });
};

export default function PrivacyPage({ lang }: Props) {
  const p = t(lang).privacy;
  return (
    <LegalDocument
      lang={lang}
      path="/privacy"
      title={p.title}
      updatedLabel={p.updated}
      updated={updated}
      sections={p.sections}
    />
  );
}
