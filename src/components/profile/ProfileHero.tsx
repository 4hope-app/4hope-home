/**
 * Top of the profile page: gold stripe band, avatar (uploaded photo, else Google's, else the
 * clover mark), display name with "No team yet" when the player has no squad, email, and the
 * sign-out button.
 */
import Icon from '../ui/Icon';
import Tag from '../ui/Tag';
import SignOutButton from './SignOutButton';
import styles from './ProfileHero.module.css';

interface Props {
  displayName: string;
  email: string | null;
  photoUrl: string | null;
  hasTeam: boolean;
  noTeamLabel: string;
  signOutLabel: string;
  /** Sign-in page in the current language, where sign-out lands. */
  signOutTo: string;
}

export default function ProfileHero({
  displayName,
  email,
  photoUrl,
  hasTeam,
  noTeamLabel,
  signOutLabel,
  signOutTo,
}: Props) {
  return (
    <div className={styles.hero}>
      <div className={styles.band} aria-hidden="true" />
      <div className={styles.row}>
        <span className={styles.avatar}>
          {photoUrl ? (
            // Google photos: no referrer, so the URL works off-site.
            <img src={photoUrl} alt="" width="84" height="84" referrerPolicy="no-referrer" />
          ) : (
            <img className={styles.clover} src="/brand/clover-mark.png" alt="" />
          )}
        </span>
        <div className={styles.text}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{displayName}</h1>
            {!hasTeam && <Tag size="sm">{noTeamLabel}</Tag>}
          </div>
          {email && <p className={styles.email}>{email}</p>}
        </div>
        <SignOutButton label={signOutLabel} callbackUrl={signOutTo} className={styles.signOut}>
          <Icon name="LogOut" size={18} />
        </SignOutButton>
      </div>
    </div>
  );
}
