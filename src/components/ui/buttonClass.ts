/**
 * Class names of the design system Button, without the Icon dependency (and its 600 KB of icon
 * data), so client components can style a <button> or <a> like `Button` does.
 */
import { cx } from '@/lib/cx';
import styles from './Button.module.css';

export interface ButtonStyle {
  variant?: 'primary' | 'neutral' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
}

export function buttonClass(
  { variant = 'primary', size = 'md', full = false }: ButtonStyle = {},
  className?: string,
): string {
  return cx(styles.btn, styles[variant], styles[size], full && styles.full, className);
}
