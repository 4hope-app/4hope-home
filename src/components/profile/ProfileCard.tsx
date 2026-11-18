/**
 * Arena card of the profile tabs: `// KICKER` heading, optional actions on its right, content.
 * No hooks and no Icon import, so client components (AccountForm, RiotAccountCard) can use it.
 */
import type { ReactNode } from 'react';
import Card from '../ui/Card';
import { cx } from '@/lib/cx';
import styles from './ProfileCard.module.css';

interface Props {
  kicker: string;
  /** Buttons next to the kicker (e.g. refresh / edit). */
  actions?: ReactNode;
  /** Hairline under the kicker row. */
  divided?: boolean;
  className?: string;
  children: ReactNode;
}

export default function ProfileCard({
  kicker,
  actions,
  divided = false,
  className,
  children,
}: Props) {
  return (
    <Card className={cx(styles.card, className)}>
      <div className={cx(styles.head, divided && styles.divided)}>
        <h2 className={`kicker ${styles.kicker}`}>{`// ${kicker}`}</h2>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {children}
    </Card>
  );
}

/** Centered icon + title + hint, with an optional action below (empty Riot account, no squad). */
export function EmptyState({
  icon,
  title,
  hint,
  children,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>{icon}</span>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyHint}>{hint}</p>
      {children && <div className={styles.emptyAction}>{children}</div>}
    </div>
  );
}
