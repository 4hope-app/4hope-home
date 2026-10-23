import type { CSSProperties } from 'react';
import Button from '../ui/Button';
import { links } from '@/data/links';
import { sectionIds } from '@/data/navigation';
import { t, type Lang } from '@/i18n/utils';
import styles from './Hero.module.css';

interface Props {
  lang: Lang;
}

/** Stripe positions, read by .bars span through custom properties. */
const bars = [
  { '--w': '560px', '--top': '-40px', '--right': '-120px' },
  { '--w': '320px', '--top': '170px', '--right': '140px', '--o': '0.85' },
  { '--w': '460px', '--top': '360px', '--right': '-60px' },
] satisfies Record<`--${string}`, string>[];

export default function Hero({ lang }: Props) {
  const h = t(lang).hero;

  return (
    <section className={styles.hero} id={sectionIds[lang].top} aria-labelledby="hero-title">
      <div className={styles.bars} aria-hidden="true">
        {bars.map((style, i) => (
          <span key={i} style={style as CSSProperties} />
        ))}
      </div>
      <div className={`container ${styles.inner}`}>
        <p className="kicker">{h.kicker}</p>
        {/* TODO: confirm the TT Bluescreens Trial license before production (wordmark face). */}
        <p className={`wordmark ${styles.wordmark}`} aria-hidden="true">
          4HOPE
        </p>
        <h1 id="hero-title" className={`display-hero ${styles.title}`}>
          {h.headline}
        </h1>
        <p className={`body-lead ${styles.sub}`}>{h.sub}</p>
        <div className={styles.ctas}>
          <Button href={links.bracket} external size="lg" iconRight="ArrowRight">
            {h.primary}
          </Button>
          <Button href={links.discord} external size="lg" variant="subtle" iconLeft="MessageCircle">
            {h.secondary}
          </Button>
        </div>
      </div>
    </section>
  );
}
