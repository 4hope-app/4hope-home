'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Spinner from '../ui/Spinner';
import Tag from '../ui/Tag';
import { buttonClass } from '../ui/buttonClass';
import ProfileCard, { EmptyState } from './ProfileCard';
import type { Dictionary } from '@/i18n/utils';
import { cx } from '@/lib/cx';
import type { RiotAccountView, RiotLinkResult } from '@/lib/riot';
import styles from './RiotAccountCard.module.css';

type Copy = Dictionary['auth']['profile']['riot'];

interface Props {
  copy: Copy;
  initialRiot: RiotAccountView | null;
  /** Minimum time between refreshes of a verified account (from RIOT_REFRESH_COOLDOWN_SECONDS). */
  cooldownMs: number;
  /** Starts Riot Sign-On; null when RSO isn't configured on the server. */
  connectHref: string | null;
  /** `?riot=` result the RSO callback came back with. */
  initialResult: RiotLinkResult | null;
  /** Rendered on the server (Icon can't be imported into a client component). */
  icons: {
    shield: ReactNode;
    link: ReactNode;
    refresh: ReactNode;
    unlink: ReactNode;
    alert: ReactNode;
  };
}

type Busy = 'refreshing' | 'unlinking' | null;
type Message = { text: string; error: boolean } | null;

const ERROR_RESULTS: RiotLinkResult[] = ['denied', 'failed', 'taken', 'not_found', 'unavailable'];

const formatCooldown = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** "GOLD II · 45 LP", or "Unranked". */
function rankLine(riot: RiotAccountView, copy: Copy): string {
  if (!riot.tier || riot.tier.toLowerCase() === 'unranked') return copy.unranked;
  const division = riot.rank ? ` ${riot.rank}` : '';
  return `${riot.tier}${division} · ${riot.lp ?? 0} LP`;
}

class RiotError extends Error {
  constructor(readonly code: RiotLinkResult | undefined) {
    super(code ?? 'request failed');
  }
}

async function callRiotApi(method: 'PATCH' | 'DELETE') {
  const res = await fetch('/api/profile/riot', { method });
  const data = (await res.json().catch(() => ({}))) as {
    riot?: RiotAccountView | null;
    error?: RiotLinkResult;
  };
  if (!res.ok) throw new RiotError(data.error);
  return data.riot ?? null;
}

/**
 * Settings → Riot account. Linking goes through Riot Sign-On (a link to /api/profile/riot/connect),
 * so only the owner of a Riot account can link it. Linked: icon, Riot ID, server, rank, with
 * refresh and unlink.
 */
export default function RiotAccountCard({
  copy,
  initialRiot,
  cooldownMs,
  connectHref,
  initialResult,
  icons,
}: Props) {
  const [riot, setRiot] = useState(initialRiot);
  const [busy, setBusy] = useState<Busy>(null);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<Message>(
    initialResult
      ? { text: copy.results[initialResult], error: ERROR_RESULTS.includes(initialResult) }
      : null,
  );

  // Drop ?riot= from the address bar so a reload doesn't repeat the message.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('riot')) return;
    url.searchParams.delete('riot');
    window.history.replaceState(null, '', url);
  }, []);

  // Clock for the refresh cooldown. Starts at 0 (= unknown) so server and client markup match.
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!riot?.verified || !riot.lastCheckedAt) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [riot?.verified, riot?.lastCheckedAt]);

  const lastChecked = riot?.lastCheckedAt ? Date.parse(riot.lastCheckedAt) : 0;
  const cooldownLeft = riot?.verified && now ? Math.max(0, cooldownMs - (now - lastChecked)) : 0;

  const errorText = (err: unknown) =>
    (err instanceof RiotError && err.code && copy.results[err.code]) || copy.results.generic;

  const onRefresh = async () => {
    if (busy || cooldownLeft > 0) return;
    setBusy('refreshing');
    setMessage(null);
    try {
      setRiot(await callRiotApi('PATCH'));
      setMessage({ text: copy.results.refreshed, error: false });
    } catch (err) {
      setMessage({ text: errorText(err), error: true });
    } finally {
      setBusy(null);
    }
  };

  const onUnlink = async () => {
    setBusy('unlinking');
    setMessage(null);
    try {
      await callRiotApi('DELETE');
      setRiot(null);
      setConfirming(false);
      setMessage({ text: copy.results.unlinked, error: false });
    } catch (err) {
      setMessage({ text: errorText(err), error: true });
    } finally {
      setBusy(null);
    }
  };

  const refreshLabel =
    cooldownLeft > 0
      ? copy.refreshIn.replace('{time}', formatCooldown(cooldownLeft))
      : copy.refresh;

  const connectButton = (label: string, size: 'sm' | 'md' = 'sm') =>
    connectHref ? (
      <a className={buttonClass({ size })} href={connectHref}>
        {icons.link}
        <span>{label}</span>
      </a>
    ) : (
      <button type="button" className={buttonClass({ size })} disabled>
        {icons.link}
        <span>{label}</span>
      </button>
    );

  return (
    <ProfileCard
      kicker={copy.kicker}
      divided
      actions={
        riot && (
          <>
            {cooldownLeft > 0 && (
              <span className={styles.cooldown} aria-hidden="true">
                {formatCooldown(cooldownLeft)}
              </span>
            )}
            <button
              type="button"
              className={cx(styles.iconButton, busy === 'refreshing' && styles.spinning)}
              aria-label={refreshLabel}
              title={refreshLabel}
              disabled={busy !== null || cooldownLeft > 0}
              onClick={onRefresh}
            >
              {icons.refresh}
            </button>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={copy.unlink}
              title={copy.unlink}
              aria-expanded={confirming}
              disabled={busy !== null}
              onClick={() => setConfirming((v) => !v)}
            >
              {icons.unlink}
            </button>
          </>
        )
      }
    >
      {riot ? (
        <>
          <div className={styles.linked}>
            <span className={styles.icon}>
              {riot.iconUrl ? (
                <img src={riot.iconUrl} alt="" width="96" height="96" />
              ) : (
                <img className={styles.clover} src="/brand/clover-mark.png" alt="" />
              )}
            </span>
            <div className={styles.info}>
              <div className={styles.idRow}>
                <p className={styles.riotId}>
                  {riot.gameName}
                  <span>{`#${riot.tagLine}`}</span>
                </p>
                <Tag size="sm">{riot.server}</Tag>
                {!riot.ownershipVerified && (
                  <span className={styles.warning} title={copy.notOwnedHint}>
                    {icons.alert}
                    {copy.notOwned}
                  </span>
                )}
                {riot.ownershipVerified && !riot.verified && (
                  <span className={styles.warning} title={copy.unverifiedHint}>
                    {icons.alert}
                    {copy.unverified}
                  </span>
                )}
              </div>
              <p className={styles.rank}>
                {riot.verified ? rankLine(riot, copy) : copy.unverifiedHint}
              </p>
            </div>
          </div>

          {/* Links made in 4hope-webpage by typing a Riot ID: offer to confirm ownership. */}
          {!riot.ownershipVerified && !confirming && (
            <div className={styles.reconnect}>
              <p>
                {connectHref ? copy.notOwnedHint : `${copy.notOwnedHint} ${copy.notConfigured}`}
              </p>
              {connectButton(copy.reconnect)}
            </div>
          )}

          {confirming && (
            <div className={styles.confirm} role="group" aria-label={copy.unlink}>
              <p>{copy.unlinkConfirm.replace('{riotId}', `${riot.gameName}#${riot.tagLine}`)}</p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={buttonClass({ variant: 'subtle', size: 'sm' })}
                  disabled={busy !== null}
                  onClick={() => setConfirming(false)}
                >
                  {copy.cancel}
                </button>
                <button
                  type="button"
                  className={cx(buttonClass({ variant: 'neutral', size: 'sm' }), styles.danger)}
                  disabled={busy !== null}
                  aria-busy={busy === 'unlinking'}
                  onClick={onUnlink}
                >
                  {busy === 'unlinking' && <Spinner size={14} />}
                  <span>{busy === 'unlinking' ? copy.unlinking : copy.unlinkYes}</span>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState icon={icons.shield} title={copy.emptyTitle} hint={copy.emptyHint}>
          <div className={styles.connect}>
            {connectButton(copy.link)}
            <p className={styles.connectHint}>{connectHref ? copy.linkHint : copy.notConfigured}</p>
          </div>
        </EmptyState>
      )}

      {message && (
        <p
          className={message.error ? styles.error : styles.notice}
          role={message.error ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      )}
    </ProfileCard>
  );
}
