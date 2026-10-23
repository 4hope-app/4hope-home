import Button from '../ui/Button';
import { links } from '@/data/links';
import { t, type Lang } from '@/i18n/utils';
import styles from './FinalCta.module.css';

interface Props {
  lang: Lang;
}

export default function FinalCta({ lang }: Props) {
  const f = t(lang).finalCta;

  return (
    <section className={styles.final} aria-labelledby="final-title">
      <div className={styles.bars} aria-hidden="true">
        <span />
        <span />
      </div>
      <div className={`container ${styles.inner}`}>
        <div>
          <h2 id="final-title" className={`display-hero ${styles.title}`}>
            {f.title}
          </h2>
          <p className={styles.body}>{f.body}</p>
        </div>
        <Button href={links.bracket} external size="lg" variant="neutral" iconRight="ArrowRight">
          {f.cta}
        </Button>
      </div>
    </section>
  );
}
