/** Terms and conditions page, shared by /terms (es) and /en/terms (en). */
import LegalDocument from './LegalDocument';
import { t, type Lang } from '@/i18n/utils';
import { TERMS_VERSION } from '@/lib/legal';
import { pageMetadata } from '@/lib/seo';

interface Props {
  lang: Lang;
}

export const termsMetadata = (lang: Lang) => {
  const p = t(lang).terms;
  return pageMetadata({ lang, path: '/terms', title: p.title, description: p.metaDescription });
};

/** "Last updated" is the terms version users accept at sign-up (bump both together). */
export default function TermsPage({ lang }: Props) {
  const p = t(lang).terms;
  return (
    <LegalDocument
      lang={lang}
      path="/terms"
      title={p.title}
      updatedLabel={p.updated}
      updated={TERMS_VERSION}
      sections={p.sections}
    />
  );
}
