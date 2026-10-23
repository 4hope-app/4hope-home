'use client';

import { useEffect } from 'react';

/** Scroll-spy: marks the nav item whose section is in view (tab underline active state). Renders nothing. */
export default function ScrollSpy() {
  useEffect(() => {
    const links = [...document.querySelectorAll<HTMLAnchorElement>('nav a[data-section]')];
    const sections = links
      .map((a) => document.getElementById(a.dataset.section ?? ''))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0 || !('IntersectionObserver' in window)) return;

    const setActive = (id: string) => {
      for (const a of links) {
        if (a.dataset.section === id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      }
    };

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        const best = [...visible.entries()].sort((a, b) => b[1] - a[1])[0];
        if (best && best[1] > 0) setActive(best[0]);
      },
      { rootMargin: '-80px 0px -45% 0px', threshold: [0, 0.15, 0.4, 0.7] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return null;
}
