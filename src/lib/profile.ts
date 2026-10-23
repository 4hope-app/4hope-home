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

/**
 * A callbackUrl that stays on this site: a path like "/profile". Anything else (absolute URLs,
 * protocol-relative "//host") falls back, so query strings can't send users off-site.
 */
export function safeCallbackUrl(value: string | null | undefined, fallback: string): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}

/** What GET /api/profile/me returns. */
export interface Profile {
  username: string;
  usernameKey: string;
  displayName: string;
  email: string | null;
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
