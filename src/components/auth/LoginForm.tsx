'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import GoogleG from '@/components/auth/GoogleG';
import Spinner from '@/components/ui/Spinner';
import { buttonClass } from '@/components/ui/buttonClass';
import type { Dictionary } from '@/i18n/utils';
import { DEFAULT_AFTER_SIGN_IN, safeCallbackUrl, withCallback } from '@/lib/profile';
import styles from '@/components/auth/auth.module.css';

interface Props {
  copy: Dictionary['auth']['login'];
}

/**
 * Google-only sign-in. After Google, Auth.js returns to /register, which skips straight to
 * ?callbackUrl= (the page the user came from, default /profile) once the profile exists.
 */
export default function LoginForm({ copy }: Props) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  // Auth.js redirects back here with ?error=… when the OAuth flow fails.
  const failed = searchParams.has('error');

  const onClick = () => {
    setLoading(true);
    const destination = safeCallbackUrl(searchParams.get('callbackUrl'), DEFAULT_AFTER_SIGN_IN);
    // Navigates away to Google; if that throws, let the user try again.
    signIn('google', { callbackUrl: withCallback('/register', destination) }).catch(() =>
      setLoading(false),
    );
  };

  return (
    <>
      <button
        type="button"
        className={buttonClass({ size: 'lg', full: true }, styles.google)}
        onClick={onClick}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? <Spinner size={18} color="#1f1f1f" /> : <GoogleG size={18} />}
        <span>{loading ? copy.loading : copy.google}</span>
      </button>
      {failed && !loading && (
        <p className={styles.error} role="alert">
          {copy.error}
        </p>
      )}
    </>
  );
}
