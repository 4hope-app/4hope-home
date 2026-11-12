'use client';

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import FormField from '../ui/FormField';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import { buttonClass } from '../ui/buttonClass';
import PhotoCropDialog from './PhotoCropDialog';
import ProfileCard from './ProfileCard';
import type { Dictionary } from '@/i18n/utils';
import { DISPLAY_NAME_MAX, bumpPhotoVersion } from '@/lib/profile';
import styles from './AccountForm.module.css';

interface Props {
  copy: Dictionary['auth']['profile']['account'];
  username: string;
  displayName: string;
  email: string | null;
  /** "Google": fills {provider} in the email hint. */
  providerName: string;
  /** The photo the user uploaded (data URL), if any. */
  uploadedPhoto: string | null;
  /** Shown when there's no upload: the Google account photo. */
  fallbackPhoto: string | null;
  /** Rendered on the server (Icon can't be imported into a client component). */
  icons: { user: ReactNode; mail: ReactNode; edit: ReactNode; close: ReactNode };
}

/**
 * Settings → Account: edit the display name and the profile photo (pick → crop → save, through
 * PATCH /api/profile/me). Username and email are read-only.
 */
export default function AccountForm({
  copy,
  username,
  displayName,
  email,
  providerName,
  uploadedPhoto,
  fallbackPhoto,
  icons,
}: Props) {
  const router = useRouter();
  const [savedName, setSavedName] = useState(displayName);
  const [draft, setDraft] = useState(displayName);
  const [savedUpload, setSavedUpload] = useState(uploadedPhoto);
  /** New cropped photo (data URL), 'remove', or null for no change. */
  const [pendingPhoto, setPendingPhoto] = useState<string | 'remove' | null>(null);
  /** Object URL of the file being cropped (the crop dialog is open while set). */
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const nameChanged = draft.trim() !== savedName.trim();
  const changed = nameChanged || pendingPhoto !== null;
  // Uploaded photo first, then the Google one.
  const upload = pendingPhoto === 'remove' ? null : (pendingPhoto ?? savedUpload);
  const shownPhoto = upload ?? fallbackPhoto;

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // picking the same file again still fires change
    if (!file) return;
    setState('idle');
    setPhotoError(!file.type.startsWith('image/'));
    if (file.type.startsWith('image/')) setCropSrc(URL.createObjectURL(file));
  };

  const onRemove = () => {
    setState('idle');
    setPhotoError(false);
    // Dropping a photo that was only picked (never saved) just cancels the pick.
    setPendingPhoto(savedUpload ? 'remove' : null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!changed) return;
    setState('saving');
    try {
      const res = await fetch('/api/profile/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(nameChanged ? { displayName: draft } : {}),
          ...(pendingPhoto === 'remove'
            ? { removePhoto: true }
            : pendingPhoto
              ? { photo: pendingPhoto }
              : {}),
        }),
      });
      if (!res.ok) throw new Error(`PATCH /api/profile/me → ${res.status}`);
      const data = (await res.json()) as { profile: { displayName: string } };
      // An empty name falls back to the username on the server; show what was stored.
      setSavedName(data.profile.displayName);
      setDraft(data.profile.displayName);
      if (pendingPhoto !== null) {
        setSavedUpload(pendingPhoto === 'remove' ? null : pendingPhoto);
        // The header avatar (AccountMenu) reloads its image.
        bumpPhotoVersion();
      }
      setPendingPhoto(null);
      setState('saved');
      // Re-render the server parts (name and photo at the top of the page).
      router.refresh();
    } catch (err) {
      console.error(err);
      setState('error');
    }
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <ProfileCard kicker={copy.kicker}>
        <div className={styles.grid}>
          <div className={styles.fields}>
            <FormField label={copy.displayName} htmlFor="p-name">
              <Input
                id="p-name"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setState('idle');
                }}
                placeholder={copy.displayNamePlaceholder}
                maxLength={DISPLAY_NAME_MAX}
                autoComplete="nickname"
              />
            </FormField>
            <FormField
              label={copy.username}
              htmlFor="p-username"
              hint={copy.usernameHint}
              messageId="p-username-hint"
            >
              <Input
                id="p-username"
                value={username}
                icon={icons.user}
                readOnly
                aria-describedby="p-username-hint"
              />
            </FormField>
          </div>

          <div className={styles.photoColumn}>
            <label className={styles.photo} title={copy.photoChange}>
              {shownPhoto ? (
                <img src={shownPhoto} alt="" referrerPolicy="no-referrer" />
              ) : (
                <img className={styles.clover} src="/brand/clover-mark.png" alt="" />
              )}
              <span className={styles.photoOverlay} aria-hidden="true">
                {icons.edit}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="visually-hidden"
                aria-label={copy.photoChange}
                onChange={onFile}
              />
            </label>
            {upload && (
              <button type="button" className={styles.photoRemove} onClick={onRemove}>
                {copy.photoRemove}
              </button>
            )}
            {photoError && (
              <p className={styles.error} role="alert">
                {copy.photoInvalid}
              </p>
            )}
          </div>
        </div>
        <FormField
          label={copy.email}
          htmlFor="p-email"
          hint={copy.emailHint.replace('{provider}', providerName)}
          messageId="p-email-hint"
        >
          <Input
            id="p-email"
            type="email"
            value={email ?? ''}
            icon={icons.mail}
            readOnly
            aria-describedby="p-email-hint"
          />
        </FormField>
      </ProfileCard>

      <div className={styles.footer}>
        {state === 'saved' && (
          <p className={styles.status} role="status">
            {copy.saved}
          </p>
        )}
        {state === 'error' && (
          <p className={styles.error} role="alert">
            {copy.error}
          </p>
        )}
        <button
          type="submit"
          className={buttonClass({ size: 'md' })}
          disabled={!changed || state === 'saving'}
          aria-busy={state === 'saving'}
        >
          {state === 'saving' && <Spinner size={16} color="var(--brand-on-gold)" />}
          <span>{state === 'saving' ? copy.saving : copy.save}</span>
        </button>
      </div>

      {/* Keyed by the file so each pick starts with a fresh crop box. */}
      <PhotoCropDialog
        key={cropSrc ?? 'closed'}
        copy={copy}
        src={cropSrc}
        closeIcon={icons.close}
        onCancel={closeCrop}
        onDone={(dataUrl) => {
          setPendingPhoto(dataUrl);
          setPhotoError(false);
          closeCrop();
        }}
        onInvalid={() => {
          setPhotoError(true);
          closeCrop();
        }}
      />
    </form>
  );
}
