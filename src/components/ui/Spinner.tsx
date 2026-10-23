/** Server/client version of the design system Spinner: indeterminate ring, gold by default. */
import type { CSSProperties } from 'react';
import styles from './Spinner.module.css';

interface Props {
  size?: number;
  color?: string;
  /** Announced to screen readers; omit when the surrounding text already says it's loading. */
  label?: string;
}

export default function Spinner({ size = 24, color = 'var(--gold-500)', label }: Props) {
  const style = {
    '--size': `${size}px`,
    '--stroke': `${Math.max(2, Math.round(size / 12))}px`,
    '--color': color,
  } as CSSProperties;

  return label ? (
    <span className={styles.spinner} style={style} role="status" aria-label={label} />
  ) : (
    <span className={styles.spinner} style={style} aria-hidden="true" />
  );
}
