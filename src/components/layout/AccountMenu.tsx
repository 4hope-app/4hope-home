'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Avatar from '../ui/Avatar';
import { buttonClass } from '../ui/buttonClass';
import type { Dictionary } from '@/i18n/utils';
import styles from './AccountMenu.module.css';

interface Props {
  copy: Dictionary['auth']['menu'];
  /** Sign-in page in the current language. */
  loginHref: string;
}

/**
 * Header account control: "Sign in" link when signed out; when signed in, the Google avatar
 * opens a menu with the profile link and "Sign out". Renders an empty slot while the session loads.
 */
export default function AccountMenu({ copy, loginHref }: Props) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (status === 'loading') return <span className={styles.slot} aria-hidden="true" />;

  if (status !== 'authenticated' || !session.user) {
    return (
      <a className={buttonClass({ variant: 'subtle', size: 'sm' })} href={loginHref}>
        {copy.signIn}
      </a>
    );
  }

  const { name, email, image } = session.user;
  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-label={copy.account}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar src={image} name={name} size="sm" />
      </button>
      <div id={menuId} className={styles.menu} hidden={!open}>
        <div className={styles.who}>
          <p className={styles.name}>{name}</p>
          <p className={styles.email}>{email}</p>
        </div>
        <a className={styles.item} href="/profile">
          {copy.profile}
        </a>
        <button
          type="button"
          className={styles.item}
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          {copy.signOut}
        </button>
      </div>
    </div>
  );
}
