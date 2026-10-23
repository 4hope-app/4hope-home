/**
 * Frame of the auth screens (login, register, profile), from the design system's LoginPage and
 * RegistrationPage templates: ink ground, faint gold stripe cluster, logo, centered arena card.
 */
import type { ReactNode } from 'react';
import Card from '../ui/Card';
import { cx } from '@/lib/cx';
import styles from './AuthShell.module.css';

interface Props {
  title: string;
  lead?: string;
  /** Card width: 400px for sign-in, 440px for forms. */
  wide?: boolean;
  /** Between the site header and footer: no full-viewport height, section padding instead. */
  framed?: boolean;
  children: ReactNode;
}

export default function AuthShell({ title, lead, wide = false, framed = false, children }: Props) {
  return (
    <div className={cx(styles.shell, framed && styles.framed)}>
      <div className={styles.bars} aria-hidden="true">
        <span data-tier="core" />
        <span data-tier="core" />
        <span data-tier="mid" />
      </div>
      <main id="main" className={styles.main}>
        <Card className={cx(styles.card, wide && styles.wide)}>
          <div className={styles.head}>
            <a href="/" aria-label="4HOPE">
              <img src="/brand/logo-sm.png" alt="" width="45" height="56" />
            </a>
            <h1 className={styles.title}>{title}</h1>
            {lead && <p className={styles.lead}>{lead}</p>}
          </div>
          {children}
        </Card>
      </main>
    </div>
  );
}
