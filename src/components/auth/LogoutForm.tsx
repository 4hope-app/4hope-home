'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Spinner from '@/components/ui/Spinner';
import { buttonClass } from '@/components/ui/buttonClass';
import type { Dictionary } from '@/i18n/utils';
import { goToCallback, isTrustedPage, safeCallbackUrl } from '@/lib/profile';
import styles from '@/components/auth/auth.module.css';

interface Props {
  copy: Dictionary['auth']['logout'];
  /** Where to go when ?callbackUrl= is missing or not allowed: the home page in this language. */
  fallback: string;
}

/**
 * /logout?callbackUrl=<page>: signs out of 4HOPE (the shared session cookie, so every 4hope.app
 * tool too) and goes to `callbackUrl`, which may be a page on a 4hope.app subdomain
 * (e.g. https://bracket.4hope.app/). Tools send their "Sign out" here.
 *
 * Signing out on page load only happens when the user came from this site or a 4hope.app
 * subdomain (the Referer). From anywhere else (a link on another site, a typed URL) the page asks
 * first, so a third-party link can't sign people out.
 */
export default function LogoutForm({ copy, fallback }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'), fallback);
  // Read once on the client (this component only renders there: it sits under Suspense with
  // useSearchParams, so it isn't prerendered).
  const [auto] = useState(
    () => typeof document !== 'undefined' && isTrustedPage(document.referrer, location.origin),
  );
  const [state, setState] = useState<'signing-out' | 'confirm' | 'error'>(
    auto ? 'signing-out' : 'confirm',
  );

  // POST /api/auth/signout clears the shared cookie (and the old host-only one), then leaves.
  const signOutAndLeave = useCallback(() => {
    signOut({ redirect: false })
      .then(() => goToCallback(callbackUrl, router, 'replace'))
      .catch((err: unknown) => {
        console.error(err);
        setState('error');
      });
  }, [callbackUrl, router]);

  // Wait for SessionProvider's first /api/auth/session to finish: that response refreshes the
  // session cookie, and arriving after the sign-out it would put the cookie back.
  const { status } = useSession();
  const started = useRef(false);
  useEffect(() => {
    if (!auto || status === 'loading' || started.current) return;
    started.current = true;
    signOutAndLeave();
  }, [auto, status, signOutAndLeave]);

  const onConfirm = () => {
    setState('signing-out');
    signOutAndLeave();
  };

  if (state === 'signing-out') {
    return (
      <div className={styles.status}>
        <Spinner size={20} />
        <span role="status">{copy.signingOut}</span>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      {state === 'error' && (
        <p className={styles.error} role="alert">
          {copy.error}
        </p>
      )}
      <button type="button" className={buttonClass({ size: 'lg', full: true })} onClick={onConfirm}>
        {state === 'error' ? copy.retry : copy.confirm}
      </button>
      <a className={buttonClass({ variant: 'subtle', size: 'lg', full: true })} href={callbackUrl}>
        {copy.cancel}
      </a>
    </div>
  );
}
