import { localizePath, t, type Lang } from '@/i18n/utils';
import styles from './auth.module.css';

/** "By continuing you agree to the Terms and Privacy Policy" line under the sign-in button. */
export default function LegalNote({ lang }: { lang: Lang }) {
  const l = t(lang).auth.legal;
  return (
    <p className={styles.legal}>
      {`${l.prefix} `}
      <a href={localizePath('/terms', lang)}>{l.terms}</a>
      {` ${l.and} `}
      <a href={localizePath('/privacy', lang)}>{l.privacy}</a>
      {l.suffix ? ` ${l.suffix}` : '.'}
    </p>
  );
}
