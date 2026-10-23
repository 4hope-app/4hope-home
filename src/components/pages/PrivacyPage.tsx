/** Privacy page, shared by /privacy (es) and /en/privacy (en). */
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { links } from '@/data/links';
import { t, type Lang } from '@/i18n/utils';
import { pageMetadata } from '@/lib/seo';
import styles from './PrivacyPage.module.css';

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
  const dateLabel = new Intl.DateTimeFormat(lang === 'es' ? 'es-419' : 'en', {
    dateStyle: 'long',
  }).format(new Date(`${updated}T12:00:00Z`));

  return (
    <>
      <Header lang={lang} path="/privacy" />
      <main id="main" className={`container ${styles.privacy}`}>
        <p className="kicker">{`// ${p.title}`}</p>
        <h1 className="display-title">{p.title}</h1>
        <p className="caption">
          {p.updated}: <time dateTime={updated}>{dateLabel}</time>
        </p>
        {p.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            <p className="body">{s.p}</p>
          </section>
        ))}
        <p className="body">
          <a href={`mailto:${links.email}`}>{links.email}</a>
        </p>
      </main>
      <Footer lang={lang} />
    </>
  );
}
