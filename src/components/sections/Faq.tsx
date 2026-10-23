import FaqAccordion from '../islands/FaqAccordion';
import SectionHead from './SectionHead';
import { sectionIds } from '@/data/navigation';
import { t, type Lang } from '@/i18n/utils';
import { jsonLd } from '@/lib/seo';
import styles from './Faq.module.css';

interface Props {
  lang: Lang;
}

export default function Faq({ lang }: Props) {
  const faq = t(lang).faq;
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };

  return (
    <section className="section" id={sectionIds[lang].faq} aria-labelledby="faq-title">
      <div className="container">
        <div className={styles.faq}>
          <SectionHead id="faq-title" kicker={faq.kicker} title={faq.title} />
          <FaqAccordion items={faq.items} />
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqPage) }} />
    </section>
  );
}
