/**
 * The signed-in user's profile, shared by /profile (es) and /en/profile (en), in one centered
 * column: header with photo and name, a divider, then the account settings (display name, photo)
 * and the linked Riot account.
 */
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import AccountForm from '../profile/AccountForm';
import ProfileHero from '../profile/ProfileHero';
import RiotAccountCard from '../profile/RiotAccountCard';
import Icon from '../ui/Icon';
import { localizePath, t, type Lang } from '@/i18n/utils';
import { envCollection, getAdminDb, type DocumentData } from '@/lib/firestore';
import { profilePhotoSrc } from '@/lib/photo';
import { isRiotLinkResult, isRiotServer, type RiotAccountView } from '@/lib/riot';
import {
  buildRiotRecord,
  riotApiKey,
  riotRefreshCooldownMs,
  rsoConfig,
  toRiotView,
  type RiotRecord,
} from '@/lib/riotApi';
import { requireProfile } from '@/lib/requireProfile';
import { pageMetadata } from '@/lib/seo';
import styles from './ProfilePage.module.css';

interface Props {
  lang: Lang;
  /** `?riot=` sent back by the Riot Sign-On callback. */
  riotResult?: string | string[];
}

export const profileMetadata = (lang: Lang) =>
  pageMetadata({ lang, path: '/profile', title: t(lang).auth.profile.title, noindex: true });

/** Whether the player's squad (managed in 4hope-webpage) still exists. */
async function hasTeam(teamId: unknown): Promise<boolean> {
  if (typeof teamId !== 'string' || !teamId) return false;
  return (await getAdminDb().collection(envCollection('teams')).doc(teamId).get()).exists;
}

/**
 * The stored Riot link as the UI shows it. A link saved while Riot was unreachable is retried
 * here, so it heals by itself once Riot answers (same as 4hope-webpage).
 */
async function loadRiot(uid: string, profile: DocumentData): Promise<RiotAccountView | null> {
  const riot = profile.riot as RiotRecord | undefined;
  if (!riot) return null;
  if (riot.verified === false && riotApiKey() && isRiotServer(riot.server)) {
    const retry = await buildRiotRecord(
      {
        puuid: typeof riot.puuid === 'string' ? riot.puuid : undefined,
        gameName: String(riot.gameName ?? ''),
        tagLine: String(riot.tagLine ?? ''),
      },
      riot.server,
      riot.linkedVia === 'rso' ? 'rso' : null,
    );
    if (retry.status === 'ok' && retry.record.verified) {
      await getAdminDb().collection(envCollection('users')).doc(uid).update({ riot: retry.record });
      return toRiotView(retry.record);
    }
  }
  return toRiotView(riot);
}

export default async function ProfilePage({ lang, riotResult }: Props) {
  const path = localizePath('/profile', lang);
  const { session, profile } = await requireProfile(path);
  const d = t(lang);
  const copy = d.auth.profile;
  const provider = session.user.provider;
  const providerName = copy.providers[provider as keyof typeof copy.providers] ?? provider;
  const displayName = (profile.displayName as string | undefined) || profile.username;
  const email = (profile.email as string | null) ?? session.user.email ?? null;
  const uploadedPhoto = profilePhotoSrc(profile);
  const googlePhoto = (profile.photo?.gmailUrl as string | undefined) ?? session.user.image ?? null;
  const [team, riot] = await Promise.all([
    hasTeam(profile.teamId),
    loadRiot(session.user.id, profile),
  ]);

  return (
    <>
      <Header lang={lang} path="/profile" />
      <main id="main" className={`container ${styles.main}`}>
        <ProfileHero
          displayName={displayName}
          email={email}
          photoUrl={uploadedPhoto ?? googlePhoto}
          hasTeam={team}
          noTeamLabel={copy.noTeam}
          signOutLabel={d.auth.menu.signOut}
          signOutTo={localizePath('/login', lang)}
        />
        <hr className={styles.divider} />
        <div className={styles.stack}>
          <AccountForm
            copy={copy.account}
            username={profile.username}
            displayName={displayName}
            email={email}
            providerName={providerName}
            uploadedPhoto={uploadedPhoto}
            fallbackPhoto={googlePhoto}
            icons={{
              user: <Icon name="User" size={16} />,
              mail: <Icon name="Mail" size={16} />,
              edit: <Icon name="Edit2" size={24} />,
              close: <Icon name="X" size={18} />,
            }}
          />
          <RiotAccountCard
            copy={copy.riot}
            initialRiot={riot}
            cooldownMs={riotRefreshCooldownMs()}
            connectHref={
              rsoConfig() ? `/api/profile/riot/connect?return=${encodeURIComponent(path)}` : null
            }
            initialResult={isRiotLinkResult(riotResult) ? riotResult : null}
            icons={{
              shield: <Icon name="Shield" size={26} />,
              link: <Icon name="LogIn" size={16} />,
              refresh: <Icon name="RefreshCw" size={16} />,
              unlink: <Icon name="Trash2" size={16} />,
              alert: <Icon name="AlertTriangle" size={12} />,
            }}
          />
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
