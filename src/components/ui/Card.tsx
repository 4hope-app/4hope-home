/**
 * Server version of the design system Card (components/Card) in tone="arena".
 * `interactive` adds the 2px lift and the 1px gold ring (shadow-ring-gold) on hover.
 * Set `href` to make the whole card a link.
 */
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Card.module.css';

interface Props {
  as?: 'div' | 'article' | 'li';
  href?: string;
  interactive?: boolean;
  external?: boolean;
  className?: string;
  id?: string;
  children?: ReactNode;
}

export default function Card({
  as: Tag = 'div',
  href,
  interactive = false,
  external = false,
  className,
  id,
  children,
}: Props) {
  const classes = cx(styles.card, (interactive || !!href) && styles.interactive, className);

  return href ? (
    <a
      className={classes}
      id={id}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
    >
      {children}
    </a>
  ) : (
    <Tag className={classes} id={id}>
      {children}
    </Tag>
  );
}
