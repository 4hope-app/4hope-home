'use client';

import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Avatar from '../ui/Avatar';
import { buttonClass } from '../ui/buttonClass';
import type { Dictionary } from '@/i18n/utils';
import {
  PROFILE_PHOTO_EVENT,
  PROFILE_PHOTO_URL,
  readPhotoVersion,
  safeCallbackUrl,
  withCallback,
} from '@/lib/profile';
import styles from './AccountMenu.module.css';

interface Props {
  copy: Dictionary['auth']['menu'];
  /** Sign-in page in the current language. */
  loginHref: string;
  /** Profile page in the current language. */
  profileHref: string;
}

/** Sign-in link that brings the user back to `here` afterwards (none for auth pages). */
const signInHref = (loginHref: string, here: string) => {
  const back = safeCallbackUrl(here, '');
  return back ? withCallback(loginHref, back) : loginHref;
};

/**
 * Header account control: "Sign in" link (back to the current page afterwards) when signed out;
 * when signed in, the avatar (uploaded photo, else Google's) opens a menu with the profile link
 * and "Sign out". Renders an empty slot while the session loads.
 */
export default function AccountMenu({ copy, loginHref, profileHref }: Props) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const pathname = usePathname();
  // When the photo last changed (see readPhotoVersion), as the avatar's ?v=. The avatar only
  // renders once the session has loaded on the client, so reading storage here can't mismatch
  // the server HTML.
  const [photoVersion, setPhotoVersion] = useState(() =>
    typeof window === 'undefined' ? '0' : readPhotoVersion(),
  );

  useEffect(() => {
    const onChange = () => setPhotoVersion(readPhotoVersion());
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key.startsWith('4hope:photo')) onChange();
    };
    window.addEventListener(PROFILE_PHOTO_EVENT, onChange);
    window.addEventListener('storage', onStorage); // changes made in other tabs
    return () => {
      window.removeEventListener(PROFILE_PHOTO_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

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
      <a
        className={buttonClass({ variant: 'subtle', size: 'sm' })}
        href={signInHref(loginHref, pathname)}
        // At click time, also keep the query and hash (e.g. /#herramientas).
        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
          const { pathname: p, search, hash } = window.location;
          e.currentTarget.href = signInHref(loginHref, `${p}${search}${hash}`);
        }}
      >
        {copy.signIn}
      </a>
    );
  }

  const { name, email } = session.user;
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
        {/* Uploaded photo, else Google's (see /api/profile/photo). */}
        <Avatar src={`${PROFILE_PHOTO_URL}?v=${photoVersion}`} name={name} size="sm" />
      </button>
      <div id={menuId} className={styles.menu} hidden={!open}>
        <div className={styles.who}>
          <p className={styles.name}>{name}</p>
          <p className={styles.email}>{email}</p>
        </div>
        <a className={styles.item} href={profileHref}>
          {copy.profile}
        </a>
        <button
          type="button"
          className={styles.item}
          onClick={() => signOut({ callbackUrl: loginHref })}
        >
          {copy.signOut}
        </button>
      </div>
    </div>
  );
}
