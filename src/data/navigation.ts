import { localizePath, t, type Lang } from '../i18n/utils';

/** Section anchors per language. Spanish ids match the spec (#equipos, #comunidad, #contacto). */
export const sectionIds = {
  es: {
    top: 'inicio',
    about: 'que-es',
    tools: 'herramientas',
    teams: 'equipos', // TODO: move to the /equipos route when the team page exists (reuse the TeamHubPage template).
    community: 'comunidad',
    faq: 'faq',
    contact: 'contacto',
  },
  en: {
    top: 'home',
    about: 'about',
    tools: 'tools',
    teams: 'teams',
    community: 'community',
    faq: 'faq',
    contact: 'contact',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type SectionKey = keyof (typeof sectionIds)['es'];

export interface NavItem {
  key: string;
  label: string;
  href: string;
  /** Section id this item tracks for the active state; external links have none. */
  section?: string;
  external?: boolean;
}

/** Main menu, same order on desktop and in the mobile drawer. Add Esports / Eventos here when they launch. */
export function getNav(lang: Lang): NavItem[] {
  const d = t(lang);
  const ids = sectionIds[lang];
  const home = localizePath('/', lang);
  return [
    { key: 'home', label: d.nav.home, href: home, section: ids.top },
    { key: 'projects', label: d.nav.projects, href: `${home}#${ids.tools}`, section: ids.tools },
    { key: 'teams', label: d.nav.teams, href: `${home}#${ids.teams}`, section: ids.teams },
    {
      key: 'community',
      label: d.nav.community,
      href: `${home}#${ids.community}`,
      section: ids.community,
    },
    { key: 'contact', label: d.nav.contact, href: `${home}#${ids.contact}`, section: ids.contact },
  ];
}

export const sectionHref = (lang: Lang, key: SectionKey): string =>
  `${localizePath('/', lang)}#${sectionIds[lang][key]}`;
