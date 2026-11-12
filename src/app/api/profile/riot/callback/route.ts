/**
 * Riot Sign-On redirect target: checks the OAuth state, reads the signed-in Riot account and links
 * it to the 4HOPE profile that started the flow, then returns to the profile with ?riot=<result>.
 * Register <origin>/api/profile/riot/callback as a redirect URI of the RSO client.
 */
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { envCollection, getAdminDb } from '@/lib/firestore';
import { serverFromPlatform } from '@/lib/riot';
import { buildRiotRecord, rsoIdentity } from '@/lib/riotApi';
import { RSO_COOKIE, backToProfile, readRsoCookie, rsoRedirectUri } from '@/lib/riotLink';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const flow = readRsoCookie((await cookies()).get(RSO_COOKIE)?.value);
  const returnTo = flow?.returnTo ?? '/profile';

  // The player closed or refused Riot's sign-in.
  if (params.get('error')) return backToProfile(request, returnTo, 'denied');

  const session = await auth();
  const code = params.get('code');
  if (!flow || !code || params.get('state') !== flow.state || session?.user.id !== flow.uid) {
    return backToProfile(request, returnTo, 'failed');
  }

  const identity = await rsoIdentity(code, rsoRedirectUri(request));
  if (!identity) return backToProfile(request, returnTo, 'failed');

  const users = getAdminDb().collection(envCollection('users'));
  if (!(await users.doc(flow.uid).get()).exists) return backToProfile(request, returnTo, 'failed');
  const owners = await users.where('riot.puuid', '==', identity.puuid).limit(2).get();
  if (owners.docs.some((d) => d.id !== flow.uid)) {
    return backToProfile(request, returnTo, 'taken');
  }

  const result = await buildRiotRecord(identity, serverFromPlatform(identity.platform), 'rso');
  if (result.status !== 'ok') return backToProfile(request, returnTo, 'failed');

  // update() replaces the whole map, so fields of a previously linked account don't linger.
  await users.doc(flow.uid).update({ riot: result.record });
  return backToProfile(request, returnTo, 'linked');
}
