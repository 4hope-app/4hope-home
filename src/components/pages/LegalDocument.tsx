/**
 * Body of the legal pages (Privacy, Terms): site header and footer, `// KICKER`, title, "last
 * updated" date, the sections from the dictionary, and the contact email.
 */
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { links } from '@/data/links';
import { htmlLang, type Lang } from '@/i18n/utils';
import styles from './LegalDocument.module.css';

interface Props {
  lang: Lang;
  /** Path without language prefix, for the language switcher. */
  path: string;
  title: string;
  updatedLabel: string;
  /** ISO date (YYYY-MM-DD) of the last change to the text. */
  updated: string;
  sections: { h: string; p: string }[];
}

export default function LegalDocument({
  lang,
  path,
  title,
  updatedLabel,
  updated,
  sections,
}: Props) {
  const dateLabel = new Intl.DateTimeFormat(htmlLang[lang], { dateStyle: 'long' }).format(
    new Date(`${updated}T12:00:00Z`),
  );

  return (
    <>
      <Header lang={lang} path={path} />
      <main id="main" className={`container ${styles.document}`}>
        <p className="kicker">{`// ${title}`}</p>
        <h1 className="display-title">{title}</h1>
        <p className="caption">
          {updatedLabel}: <time dateTime={updated}>{dateLabel}</time>
        </p>
        {sections.map((s) => (
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
