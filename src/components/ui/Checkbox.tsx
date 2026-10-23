/**
 * Server/client version of the design system Checkbox: gold fill and ink check when checked.
 * A native checkbox (visually hidden) keeps keyboard, form and screen-reader behavior.
 */
import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Checkbox.module.css';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
}

export default function Checkbox({ label, ...rest }: Props) {
  return (
    <label className={styles.checkbox}>
      <input type="checkbox" className={`visually-hidden ${styles.native}`} {...rest} />
      <span className={styles.box} aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <polyline
            points="20 6 9 17 4 12"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.label}>{label}</span>
    </label>
  );
}
