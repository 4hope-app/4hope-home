/**
 * Server version of the design system Badge (components/Badge): tiny pill or status dot.
 * Use a word inside (SOON, NEW) — a bare dot needs a visible label next to it.
 */
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Badge.module.css';

interface Props {
  scheme?: 'brand' | 'neutral' | 'positive' | 'danger';
  dot?: boolean;
  children?: ReactNode;
}

export default function Badge({ scheme = 'brand', dot = false, children }: Props) {
  return dot ? (
    <span className={cx(styles.dot, styles[scheme])} aria-hidden="true" />
  ) : (
    <span className={cx(styles.badge, styles[scheme])}>{children}</span>
  );
}
