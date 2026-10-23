import AccountMenu from './AccountMenu';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from '../islands/MobileMenu';
import ScrollSpy from './ScrollSpy';
import { getNav } from '@/data/navigation';
import { languages, localizePath, t, type Lang } from '@/i18n/utils';
import styles from './Header.module.css';

interface Props {
  lang: Lang;
  /** Current page path without language prefix, for the language switcher. */
  path: string;
  /** Hide the account control (e.g. on the sign-in page, where it would only repeat the page). */
  showAccount?: boolean;
}

export default function Header({ lang, path, showAccount = true }: Props) {
  const d = t(lang);
  const nav = getNav(lang);
  const langs = (Object.keys(languages) as Lang[]).map((l) => ({
    code: l,
    label: l.toUpperCase(),
    href: localizePath(path, l),
    current: l === lang,
  }));

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a className={styles.logo} href={localizePath('/', lang)} aria-label="4HOPE">
          <img src="/brand/logo-sm.png" alt="" width="36" height="45" />
        </a>

        <nav className={styles.nav} aria-label={d.a11y.mainNav}>
          <ul className={styles.tabs}>
            {nav.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  data-section={item.section}
                  {...(item.external ? { target: '_blank', rel: 'noopener' } : {})}
                >
                  {item.label}
                  {item.external && <span className="visually-hidden"> {d.a11y.newTab}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher lang={lang} path={path} />
          {showAccount && (
            <AccountMenu copy={d.auth.menu} loginHref={localizePath('/login', lang)} />
          )}
        </div>

        <div className={styles.mobile}>
          {showAccount && (
            <AccountMenu copy={d.auth.menu} loginHref={localizePath('/login', lang)} />
          )}
          <MobileMenu
            items={nav.map(({ key, label, href, external }) => ({ key, label, href, external }))}
            languages={langs}
            openLabel={d.a11y.openMenu}
            closeLabel={d.a11y.closeMenu}
            newTabLabel={d.a11y.newTab}
          />
        </div>
      </div>
      <ScrollSpy />
    </header>
  );
}
