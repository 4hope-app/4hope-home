'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Avatar from '@/components/ui/Avatar';
import Checkbox from '@/components/ui/Checkbox';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { buttonClass } from '@/components/ui/buttonClass';
import type { Dictionary } from '@/i18n/utils';
import {
  DISPLAY_NAME_MAX,
  USERNAME_MAX,
  isValidUsername,
  safeCallbackUrl,
  usernameFromEmail,
  type ProfileMeResponse,
} from '@/lib/profile';
import styles from '@/components/auth/auth.module.css';

interface Props {
  copy: Dictionary['auth']['register'];
  legal: Dictionary['auth']['legal'];
}

type Account = Extract<ProfileMeResponse, { exists: false }>['account'];

/**
 * Checks GET /api/profile/me on mount: not signed in → /login, profile already complete →
 * callbackUrl (default /profile), otherwise shows the form and POSTs it.
 */
export default function RegisterForm({ copy, legal }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'), '/profile');

  const [account, setAccount] = useState<Account | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/profile/me', { cache: 'no-store' })
      .then(async (res) => {
        if (!alive) return;
        if (res.status === 401) return router.replace('/login');
        if (!res.ok) throw new Error(`GET /api/profile/me → ${res.status}`);
        const data = (await res.json()) as ProfileMeResponse;
        if (!alive) return;
        if (data.exists) return router.replace(callbackUrl);
        setAccount(data.account);
        setUsername(usernameFromEmail(data.account.email));
      })
      .catch((err: unknown) => {
        console.error(err);
        if (alive) setFormError(copy.error);
      });
    return () => {
      alive = false;
    };
  }, [router, callbackUrl, copy.error]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const usernameOk = isValidUsername(username);
    setUsernameError(usernameOk ? null : copy.usernameInvalid);
    setTermsError(accepted ? null : copy.acceptRequired);
    setFormError(null);
    if (!usernameOk || !accepted) return;

    setSaving(true);
    try {
      const res = await fetch('/api/profile/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, displayName, acceptedTerms: true }),
      });
      if (res.status === 401) return router.replace('/login');
      if (res.status === 409) {
        setUsernameError(copy.usernameTaken);
        return setSaving(false);
      }
      if (!res.ok) throw new Error(`POST /api/profile/me → ${res.status}`);
      router.push(callbackUrl);
    } catch (err) {
      console.error(err);
      setFormError(copy.error);
      setSaving(false);
    }
  };

  if (!account) {
    return formError ? (
      <p className={styles.error} role="alert">
        {formError}
      </p>
    ) : (
      <div className={styles.status}>
        <Spinner size={20} />
        <span role="status">{copy.loading}</span>
      </div>
    );
  }

  return (
    <>
      <div className={styles.account}>
        <Avatar src={account.picture} name={account.name} size="lg" ring />
        <div className={styles.accountText}>
          <div className={styles.accountName}>{account.name}</div>
          <div className={styles.accountEmail}>{account.email}</div>
        </div>
      </div>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <FormField
          label={copy.username}
          htmlFor="username"
          hint={copy.usernameHint}
          error={usernameError}
          messageId="username-message"
          required
        >
          <Input
            id="username"
            name="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.replace(/[^A-Za-z0-9_-]/g, ''));
              setUsernameError(null);
            }}
            maxLength={USERNAME_MAX}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            invalid={!!usernameError}
            aria-describedby="username-message"
          />
        </FormField>

        <FormField
          label={copy.displayName}
          htmlFor="displayName"
          hint={copy.displayNameHint}
          messageId="displayName-message"
        >
          <Input
            id="displayName"
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={account.name ?? undefined}
            maxLength={DISPLAY_NAME_MAX}
            autoComplete="nickname"
            aria-describedby="displayName-message"
          />
        </FormField>

        <div>
          <Checkbox
            checked={accepted}
            onChange={(e) => {
              setAccepted(e.target.checked);
              setTermsError(null);
            }}
            required
            aria-invalid={!!termsError || undefined}
            aria-describedby={termsError ? 'terms-message' : undefined}
            label={
              <>
                {`${copy.acceptPrefix} `}
                <a href="/terms" target="_blank" rel="noopener">
                  {legal.terms}
                </a>
                {` ${copy.acceptAnd} `}
                <a href="/privacy" target="_blank" rel="noopener">
                  {legal.privacy}
                </a>
                .
              </>
            }
          />
          {termsError && (
            <p className={styles.error} id="terms-message" role="alert">
              {termsError}
            </p>
          )}
        </div>

        <button
          type="submit"
          className={buttonClass({ size: 'lg', full: true }, styles.submit)}
          disabled={saving}
          aria-busy={saving}
        >
          {saving && <Spinner size={18} color="var(--brand-on-gold)" />}
          <span>{saving ? copy.saving : copy.submit}</span>
        </button>
        {formError && (
          <p className={styles.error} role="alert">
            {formError}
          </p>
        )}
      </form>

      <p className={styles.switch}>
        {`${copy.signedInAs} ${account.email}. ${copy.notYou} `}
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          {copy.switchAccount}
        </button>
      </p>
    </>
  );
}
