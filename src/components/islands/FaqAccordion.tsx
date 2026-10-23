'use client';

import { useRef } from 'react';
import { useDesignSystem, useInView } from './design-system';

interface Props {
  items: { q: string; a: string }[];
}

/**
 * FAQ with the design system Accordion. The server render (and the first client render)
 * is a native <details> list, so every answer is in the HTML for search engines and
 * works without JavaScript; it swaps to the Accordion once it scrolls into view and the
 * bundle is ready.
 */
export default function FaqAccordion({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const ds = useDesignSystem(useInView(ref));

  if (ds) {
    return <ds.Accordion items={items.map((it) => ({ title: it.q, content: it.a }))} />;
  }

  return (
    <div className="faq-static" ref={ref}>
      {items.map((it) => (
        <details key={it.q}>
          <summary>{it.q}</summary>
          <p>{it.a}</p>
        </details>
      ))}
    </div>
  );
}
