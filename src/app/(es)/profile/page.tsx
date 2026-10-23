import AuthShell from '@/components/auth/AuthShell';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import { t } from '@/i18n/utils';
import { requireProfile } from '@/lib/requireProfile';
import { pageMetadata } from '@/lib/seo';
import ProfileForm from './ProfileForm';
import styles from './profile.module.css';

const d = t('es');

export const metadata = pageMetadata({
  lang: 'es',
  path: '/profile',
  title: d.auth.profile.title,
  noindex: true,
});

export default async function ProfilePage() {
  const { session, profile } = await requireProfile('/profile');
  const copy = d.auth.profile;
  const photo = (profile.photo?.gmailUrl as string | undefined) ?? session.user.image;

  return (
    <AuthShell title={copy.title} wide>
      <div className={styles.identity}>
        <Avatar src={photo} name={profile.displayName ?? profile.username} size="xl" ring />
        <div className={styles.names}>
          <p className={styles.displayName}>{profile.displayName ?? profile.username}</p>
          <p className={styles.username}>{`@${profile.username}`}</p>
        </div>
      </div>

      <dl className={styles.details}>
        <div>
          <dt>{copy.email}</dt>
          <dd>{profile.email ?? session.user.email}</dd>
        </div>
        <div>
          <dt>{copy.plan}</dt>
          <dd>
            <Tag scheme="brand" variant="solid" size="sm">
              {profile.plan ?? 'basic'}
            </Tag>
          </dd>
        </div>
      </dl>

      <ProfileForm
        copy={copy}
        signOutLabel={d.auth.menu.signOut}
        initialDisplayName={profile.displayName ?? ''}
      />
    </AuthShell>
  );
}
