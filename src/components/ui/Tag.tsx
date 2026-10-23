/**
 * Server version of the design system Tag (components/Tag): uppercase status chip.
 * Always carries a word (LIVE, SOON, WIN…), never colour alone.
 */
import type { ReactNode } from 'react';
import Icon from './Icon';
import { cx } from '@/lib/cx';
import styles from './Tag.module.css';

interface Props {
  scheme?: 'brand' | 'neutral' | 'positive' | 'warning' | 'danger';
  variant?: 'subtle' | 'solid';
  size?: 'sm' | 'md';
  icon?: string;
  children?: ReactNode;
}

export default function Tag({
  scheme = 'neutral',
  variant = 'subtle',
  size = 'md',
  icon,
  children,
}: Props) {
  return (
    <span className={cx(styles.tag, styles[`${scheme}-${variant}`], styles[size])}>
      {icon && <Icon name={icon} size={size === 'sm' ? 12 : 14} />}
      {children}
    </span>
  );
}
