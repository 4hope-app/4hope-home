import { languages, localizePath, t, type Lang } from '@/i18n/utils';
import styles from './LanguageSwitcher.module.css';

interface Props {
  lang: Lang;
  /** Current page path without language prefix. */
  path: string;
}

export default function LanguageSwitcher({ lang, path }: Props) {
  const d = t(lang);
  const langs = Object.keys(languages) as Lang[];

  return (
    <nav className={styles.lang} aria-label={d.a11y.language}>
      {langs.map((l) => (
        <a
          key={l}
          href={localizePath(path, l)}
          hrefLang={l}
          lang={l}
          aria-current={l === lang ? 'true' : undefined}
          aria-label={`${l.toUpperCase()} · ${languages[l]}`}
        >
          {l.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}
