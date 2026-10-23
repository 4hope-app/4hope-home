/**
 * Server/client version of the design system Input: 42px field, gold border and halo on focus,
 * danger border when `invalid`. All native <input> props pass through.
 */
import type { InputHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import styles from './Input.module.css';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
}

export default function Input({ size = 'md', invalid = false, className, ...rest }: Props) {
  return (
    <div className={cx(styles.box, styles[size], invalid && styles.invalid, className)}>
      <input className={styles.input} aria-invalid={invalid || undefined} {...rest} />
    </div>
  );
}
