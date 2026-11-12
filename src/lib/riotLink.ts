/**
 * Server-only helpers of the Riot Sign-On link flow (GET /api/profile/riot/connect → Riot →
 * GET /api/profile/riot/callback). A short-lived httpOnly cookie carries the OAuth `state`, the
 * user it was started for, and the profile page to return to.
 */
import { NextResponse } from 'next/server';
import type { RiotLinkResult } from './riot';

export const RSO_COOKIE = 'riot_rso';
const COOKIE_PATH = '/api/profile/riot';

/** Profile pages the flow may return to. */
const RETURN_PATHS = ['/profile', '/en/profile'];

export const safeReturnPath = (value: string | null | undefined): string =>
  value && RETURN_PATHS.includes(value) ? value : '/profile';

export interface RsoCookie {
  state: string;
  uid: string;
  returnTo: string;
}

export const rsoRedirectUri = (request: Request) =>
  `${new URL(request.url).origin}/api/profile/riot/callback`;

export function readRsoCookie(value: string | undefined): RsoCookie | null {
  if (!value) return null;
  try {
    const data = JSON.parse(value) as Partial<RsoCookie>;
    return data.state && data.uid && data.returnTo
      ? { state: data.state, uid: data.uid, returnTo: safeReturnPath(data.returnTo) }
      : null;
  } catch {
    return null;
  }
}

export function setRsoCookie(res: NextResponse, request: Request, value: RsoCookie) {
  res.cookies.set(RSO_COOKIE, JSON.stringify(value), {
    httpOnly: true,
    secure: new URL(request.url).protocol === 'https:',
    sameSite: 'lax',
    path: COOKIE_PATH,
    maxAge: 600,
  });
}

/** Back to the profile page with `?riot=<result>`, clearing the flow cookie. */
export function backToProfile(request: Request, returnTo: string, result: RiotLinkResult) {
  const url = new URL(returnTo, request.url);
  url.searchParams.set('riot', result);
  const res = NextResponse.redirect(url);
  res.cookies.set(RSO_COOKIE, '', { path: COOKIE_PATH, maxAge: 0 });
  return res;
}
