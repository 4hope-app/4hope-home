/**
 * Starts linking a Riot account: sends the signed-in player to Riot's sign-in page (RSO).
 *   GET /api/profile/riot/connect?return=/en/profile
 * Not signed in → /login. RSO not configured → back to the profile with ?riot=unavailable.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { withCallback } from '@/lib/profile';
import { rsoAuthorizeUrl, rsoConfig } from '@/lib/riotApi';
import { backToProfile, rsoRedirectUri, safeReturnPath, setRsoCookie } from '@/lib/riotLink';

export async function GET(request: Request) {
  const returnTo = safeReturnPath(new URL(request.url).searchParams.get('return'));
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL(withCallback('/login', returnTo), request.url));
  }

  const config = rsoConfig();
  if (!config) return backToProfile(request, returnTo, 'unavailable');

  const state = crypto.randomUUID();
  const res = NextResponse.redirect(
    rsoAuthorizeUrl(config.clientId, rsoRedirectUri(request), state),
  );
  setRsoCookie(res, request, { state, uid: session.user.id, returnTo });
  return res;
}
