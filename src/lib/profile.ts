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

/** Sign-in, onboarding and sign-out pages: never a callback destination (it would loop). */
const AUTH_PATHS = ['/login', '/en/login', '/register', '/logout', '/en/logout'];

/**
 * The 4HOPE domain. A callbackUrl may point at it or at any of its subdomains (the tools, e.g.
 * https://bracket.4hope.app/…), always over https.
 */
export const TRUSTED_DOMAIN = '4hope.app';

const isTrustedHost = (hostname: string) =>
  hostname === TRUSTED_DOMAIN || hostname.endsWith(`.${TRUSTED_DOMAIN}`);

/**
 * Whether a URL (e.g. `document.referrer`) is a page of this site (`origin`) or an https page on
 * 4hope.app or one of its subdomains. Empty or unparsable → false.
 */
export function isTrustedPage(url: string | null | undefined, origin: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.origin === origin) return true;
    return parsed.protocol === 'https:' && !parsed.port && isTrustedHost(parsed.hostname);
  } catch {
    return false;
  }
}

/** Path with %-escapes decoded (so "/%6Cogin" counts as "/login"), lowercased, no trailing "/". */
function normalizedPath(pathname: string): string {
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    // Malformed escapes: compare as-is.
  }
  return path.toLowerCase().replace(/\/+$/, '') || '/';
}

/**
 * A callbackUrl that's safe to send the user to after signing in, else `fallback`. Accepted:
 *   - a path on this site: "/profile", "/en?x=1#faq";
 *   - an https URL on 4hope.app or one of its subdomains: "https://bracket.4hope.app/t/123".
 * Everything else falls back, so a crafted link can't turn sign-in into an open redirect:
 * other hosts and look-alikes ("evil4hope.app", "4hope.app.evil.com", "4hope.app@evil.com"),
 * protocol-relative "//host" and "/\host" (browsers read "\" as "/"), other schemes
 * ("javascript:", "data:", "http:"), credentials or explicit ports, and any whitespace or control
 * character (browsers strip some of them, which can change how a URL is read).
 * Sign-in pages fall back too, so a callback never points back at the sign-in flow.
 * Paths come back normalized; absolute URLs come back as the parsed `href`.
 */
export function safeCallbackUrl(value: string | null | undefined, fallback: string): string {
  // Bounded length; no "\", whitespace or control characters anywhere.
  if (!value || value.length > 2048 || /[\\\s\u0000-\u001f\u007f]/.test(value)) return fallback;

  if (value.startsWith('/')) {
    if (value.startsWith('//')) return fallback;
    // Resolve against a placeholder origin: if the result left it, the path wasn't a path.
    const base = 'https://callback.invalid';
    let url: URL;
    try {
      url = new URL(value, base);
    } catch {
      return fallback;
    }
    if (url.origin !== base) return fallback;
    if (AUTH_PATHS.includes(normalizedPath(url.pathname))) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return fallback;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return fallback;
  if (!isTrustedHost(url.hostname)) return fallback;
  if (url.hostname === TRUSTED_DOMAIN && AUTH_PATHS.includes(normalizedPath(url.pathname))) {
    return fallback;
  }
  return url.href;
}

/** Navigates to a callbackUrl from safeCallbackUrl: client-side for paths, a full load for URLs. */
export function goToCallback(
  url: string,
  router: { push(href: string): void; replace(href: string): void },
  mode: 'push' | 'replace' = 'push',
): void {
  if (url.startsWith('/')) router[mode](url);
  else if (mode === 'replace') window.location.replace(url);
  else window.location.assign(url);
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
  updatedAt?: string | null;
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
