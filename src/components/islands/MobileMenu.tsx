'use client';

import { useEffect, useRef, useState } from 'react';
import { loadDesignSystem, type DesignSystem } from './design-system';

interface Item {
  key: string;
  label: string;
  href: string;
  external?: boolean;
}

interface Props {
  items: Item[];
  languages: { code: string; label: string; href: string; current: boolean }[];
  openLabel: string;
  closeLabel: string;
  newTabLabel: string;
}

const MenuGlyph = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {open ? (
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    ) : (
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    )}
  </svg>
);

/**
 * Mobile navigation drawer. The toggle is plain markup so it costs nothing until tapped;
 * the design system bundle (MenuItem) loads on first open.
 */
export default function MobileMenu({
  items,
  languages,
  openLabel,
  closeLabel,
  newTabLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [ds, setDs] = useState<DesignSystem | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    if (!ds)
      loadDesignSystem()
        .then(setDs)
        .catch((err: unknown) => console.error(err));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, ds]);

  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('button, a')?.focus();
  }, [open, ds]);

  const go = (item: Item) => {
    setOpen(false);
    if (item.external) window.open(item.href, '_blank', 'noopener');
    else window.location.assign(item.href);
  };

  return (
    <div className="mobile-menu">
      <button
        ref={toggleRef}
        type="button"
        className="mobile-menu__toggle"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <MenuGlyph open={open} />
      </button>

      <div id="mobile-menu-panel" ref={panelRef} className="mobile-menu__panel" hidden={!open}>
        <ul className="mobile-menu__list">
          {items.map((item) => (
            <li key={item.key}>
              {ds ? (
                <ds.MenuItem
                  onClick={() => go(item)}
                  icon={
                    item.external ? (
                      <ds.Icon name="ExternalLink" size={16} aria-hidden />
                    ) : undefined
                  }
                >
                  {item.label}
                  {item.external && <span className="visually-hidden"> {newTabLabel}</span>}
                </ds.MenuItem>
              ) : (
                <a
                  className="mobile-menu__link"
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noopener' } : {})}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
        <div className="mobile-menu__foot">
          <div className="mobile-menu__langs">
            {languages.map((l) => (
              <a
                key={l.code}
                href={l.href}
                hrefLang={l.code}
                aria-current={l.current ? 'true' : undefined}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
