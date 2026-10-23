/** Server/client version of the design system Avatar: image or initials, optional gold ring. */
import { cx } from '@/lib/cx';
import styles from './Avatar.module.css';

interface Props {
  src?: string | null;
  /** Used for the initials fallback and the alt text. */
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
}

export default function Avatar({ src, name, size = 'md', ring = false }: Props) {
  const initials = (name ?? '')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span className={cx(styles.avatar, styles[size], ring && styles.ring)}>
      {/* Google profile photos: plain <img>, no referrer so the URL works off-site. */}
      {src ? <img src={src} alt={name ?? ''} referrerPolicy="no-referrer" /> : initials || '?'}
    </span>
  );
}
