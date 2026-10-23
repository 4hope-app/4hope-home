'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { buttonClass } from '@/components/ui/buttonClass';
import type { Dictionary } from '@/i18n/utils';
import { DISPLAY_NAME_MAX } from '@/lib/profile';
import styles from './profile.module.css';
import authStyles from '@/components/auth/auth.module.css';

interface Props {
  copy: Dictionary['auth']['profile'];
  signOutLabel: string;
  initialDisplayName: string;
}

/** Edits the display name (PATCH /api/profile/me) and signs out. */
export default function ProfileForm({ copy, signOutLabel, initialDisplayName }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setState('saving');
    try {
      const res = await fetch('/api/profile/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });
      if (!res.ok) throw new Error(`PATCH /api/profile/me → ${res.status}`);
      setState('saved');
      // Re-render the server part (name and avatar above the form) with the new value.
      router.refresh();
    } catch (err) {
      console.error(err);
      setState('error');
    }
  };

  return (
    <form className={authStyles.form} onSubmit={onSubmit}>
      <FormField
        label={copy.displayName}
        htmlFor="displayName"
        hint={copy.displayNameHint}
        error={state === 'error' ? copy.error : null}
        messageId="displayName-message"
      >
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setState('idle');
          }}
          maxLength={DISPLAY_NAME_MAX}
          autoComplete="nickname"
          aria-describedby="displayName-message"
        />
      </FormField>
      {state === 'saved' && (
        <p className={authStyles.success} role="status">
          {copy.saved}
        </p>
      )}
      <div className={styles.actions}>
        <button
          type="submit"
          className={buttonClass({ size: 'md' })}
          disabled={state === 'saving'}
          aria-busy={state === 'saving'}
        >
          {state === 'saving' && <Spinner size={16} color="var(--brand-on-gold)" />}
          <span>{state === 'saving' ? copy.saving : copy.save}</span>
        </button>
        <a className={buttonClass({ variant: 'subtle', size: 'md' })} href="/">
          {copy.home}
        </a>
        <button
          type="button"
          className={buttonClass({ variant: 'subtle', size: 'md' })}
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          {signOutLabel}
        </button>
      </div>
    </form>
  );
}
