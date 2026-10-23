/**
 * 404, based on the design system's ErrorPage template (ink + gold stripe, status code hero,
 * recovery actions). Served for any unmatched URL, so it shows Spanish (the default) with an
 * English line.
 */
import Button from '../ui/Button';
import { links } from '@/data/links';
import { t } from '@/i18n/utils';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  const es = t('es').notFound;
  const en = t('en').notFound;

  return (
    <div className={styles.err}>
      <div className={styles.bars} aria-hidden="true">
        <span />
        <span />
      </div>
      <header className={`container ${styles.top}`}>
        <a className={styles.link} href="/" aria-label="4HOPE">
          <img src="/brand/logo-sm.png" alt="" width="36" height="45" />
        </a>
        <span className={styles.status}>404</span>
      </header>
      <main id="main" className={`container ${styles.main}`}>
        <p className="kicker">{es.kicker}</p>
        <p className={styles.code} aria-hidden="true">
          404
        </p>
        <h1 className="display-title">{es.headline}</h1>
        <p className="body-lead">{es.body}</p>
        <p className="body" lang="en">
          {`${en.headline} ${en.body} `}
          <a className={styles.link} href="/en">
            {en.home}
          </a>
        </p>
        <div className={styles.ctas}>
          <Button href="/" size="lg">
            {es.home}
          </Button>
          <Button href={links.bracket} external size="lg" variant="subtle">
            {es.bracket}
          </Button>
        </div>
      </main>
    </div>
  );
}
