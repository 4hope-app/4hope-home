/** Profile rules shared by the onboarding form (client) and /api/profile/me (server). */

export const USERNAME_PATTERN = /^[A-Za-z0-9_-]{1,24}$/;
export const USERNAME_MAX = 24;
export const DISPLAY_NAME_MAX = 40;

export const isValidUsername = (value: unknown): value is string =>
  typeof value === 'string' && USERNAME_PATTERN.test(value);

/** Suggested username from an email: the local part, invalid characters dropped, 24 max. */
export function usernameFromEmail(email: string | null | undefined): string {
  const local = (email ?? '').split('@')[0] ?? '';
  return local.replace(/[^A-Za-z0-9_-]/g, '').slice(0, USERNAME_MAX);
}

/** Sign-in and onboarding pages: never a destination after signing in (it would loop). */
const AUTH_PATHS = ['/login', '/en/login', '/register'];

/**
 * A callbackUrl that stays on this site: a path like "/profile". Anything else (absolute URLs,
 * protocol-relative "//host" or "/\host", which browsers treat alike) falls back, so query strings can't send users off-site.
 * Auth pages fall back too, so a callback never points back at the sign-in flow.
 */
export function safeCallbackUrl(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  const pathname = value.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return AUTH_PATHS.includes(pathname) ? fallback : value;
}

/** `path` with `?callbackUrl=` set to `callbackUrl`: withCallback('/login', '/en') → '/login?callbackUrl=%2Fen'. */
export const withCallback = (path: string, callbackUrl: string): string =>
  `${path}?callbackUrl=${encodeURIComponent(callbackUrl)}`;

/** Where users land after signing in when they didn't come from another page. */
export const DEFAULT_AFTER_SIGN_IN = '/profile';

/** What GET /api/profile/me returns. */
export interface Profile {
  username: string;
  usernameKey: string;
  displayName: string;
  email: string | null;
  /** Auth.js provider id the account signed up with, e.g. "google". */
  provider?: string;
  photo?: { gmailUrl?: string | null };
  plan?: string;
  termsVersion?: string;
  createdAt?: string | null;
  termsAcceptedAt?: string | null;
}

export type ProfileMeResponse =
  | {
      exists: false;
      account: { name: string | null; email: string | null; picture: string | null };
    }
  | { exists: true; profile: Profile };

/** Custom profile photo: square, re-encoded in the browser before upload. */
export const PHOTO_DIMENSION = 256;
/** Upper bound of the encoded photo (a 256 px WebP is ~10–30 KB). */
export const PHOTO_MAX_BYTES = 200 * 1024;

/** Window event fired after the profile photo changes, so the header avatar reloads it. */
export const PROFILE_PHOTO_EVENT = '4hope:profile-photo';

/**
 * localStorage key holding when the photo last changed. The header avatar puts it in `?v=`, so
 * after an upload or removal every page (and tab) asks for a new URL instead of reusing a cached
 * image. Best effort: storage can be unavailable (private mode), then it's just "0".
 */
const PHOTO_VERSION_KEY = '4hope:photo-v';

export function readPhotoVersion(): string {
  try {
    return window.localStorage.getItem(PHOTO_VERSION_KEY) ?? '0';
  } catch {
    return '0';
  }
}

/** Records a photo change and tells this tab's header avatar to reload. */
export function bumpPhotoVersion(): void {
  try {
    window.localStorage.setItem(PHOTO_VERSION_KEY, String(Date.now()));
  } catch {
    // Storage blocked: the event below still updates this page.
  }
  window.dispatchEvent(new Event(PROFILE_PHOTO_EVENT));
}

/** The signed-in user's avatar (uploaded photo, else Google's): GET /api/profile/photo. */
export const PROFILE_PHOTO_URL = '/api/profile/photo';
