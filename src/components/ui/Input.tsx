/**
 * Server/client version of the design system Input: 42px field, gold border and halo on focus,
 * danger border when `invalid`, optional leading `icon` (pass an <Icon />). All native <input>
 * props pass through.
 */
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Input.module.css';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  icon?: ReactNode;
}

export default function Input({ size = 'md', invalid = false, icon, className, ...rest }: Props) {
  return (
    <div className={cx(styles.box, styles[size], invalid && styles.invalid, className)}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <input className={styles.input} aria-invalid={invalid || undefined} {...rest} />
    </div>
  );
}
