import Icon from '../ui/Icon';
import { links, socials } from '@/data/links';
import { sectionHref } from '@/data/navigation';
import { localizePath, t, type Lang } from '@/i18n/utils';
import styles from './Footer.module.css';

interface Props {
  lang: Lang;
}

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  icon?: string;
}

const disclaimerId = 'riot-disclaimer';

export default function Footer({ lang }: Props) {
  const d = t(lang);
  const f = d.footer;

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: f.product,
      links: [
        { label: f.links.tools, href: sectionHref(lang, 'tools') },
        { label: f.links.bracket, href: links.bracket, external: true },
        { label: f.links.faq, href: sectionHref(lang, 'faq') },
      ],
    },
    {
      title: f.community,
      links: socials.map((s) => ({ label: s.label, href: s.href, external: true, icon: s.icon })),
    },
    {
      title: f.legal,
      links: [
        { label: f.links.privacy, href: localizePath('/privacy', lang) },
        { label: f.links.disclaimer, href: `#${disclaimerId}` },
      ],
    },
    {
      title: f.contact,
      links: [
        { label: f.links.email, href: `mailto:${links.email}` },
        { label: f.links.suggest, href: links.suggest, external: true },
        { label: d.nav.contact, href: sectionHref(lang, 'contact') },
      ],
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <img src="/brand/logo-sm.png" alt="4HOPE" width="44" height="55" loading="lazy" />
            <p className="body">{f.tagline}</p>
          </div>
          <nav className={styles.cols} aria-label={d.a11y.footerNav}>
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="kicker">{`// ${col.title}`}</h2>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        {...(l.external ? { target: '_blank', rel: 'noopener' } : {})}
                      >
                        {l.icon && <Icon name={l.icon} size={16} />}
                        {l.label}
                        {l.external && <span className="visually-hidden"> {d.a11y.newTab}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <hr />
        <p id={disclaimerId} className={`caption ${styles.legal}`} lang="en">
          {f.disclaimer}
        </p>
        <p className="caption">{`© ${new Date().getFullYear()} 4HOPE · ${f.rights}`}</p>
      </div>
    </footer>
  );
}
