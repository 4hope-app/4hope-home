/**
 * The signed-in user's avatar, for the header account menu (the JWT can't carry the image):
 * the photo uploaded on /profile, else a redirect to the Google photo, else the clover mark.
 * 401 when signed out.
 *
 * Never served from the browser cache without asking: the photo can change (or be removed) on
 * /profile, and every page's header requests this same URL. An ETag keeps unchanged photos to a
 * 304 with no body.
 */
import { NextResponse } from 'next/server';
import { envCollection, getAdminDb } from '@/lib/firebaseAdmin';
import { profilePhoto } from '@/lib/photo';
import { requireSession } from '@/lib/requireSession';

async function etagOf(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-1', bytes));
  return `"${Array.from(digest, (b) => b.toString(16).padStart(2, '0')).join('')}"`;
}

export async function GET(request: Request) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const profile = (
    await getAdminDb().collection(envCollection('users')).doc(session.user.id).get()
  ).data();
  const uploaded = profile ? profilePhoto(profile) : null;
  if (uploaded) {
    const bytes = new Uint8Array(uploaded.bytes);
    const etag = await etagOf(bytes);
    const headers = { ETag: etag, 'Cache-Control': 'private, no-cache' };
    if (request.headers.get('if-none-match') === etag) {
      return new NextResponse(null, { status: 304, headers });
    }
    return new NextResponse(bytes, {
      headers: { ...headers, 'Content-Type': uploaded.contentType },
    });
  }

  const google = (profile?.photo?.gmailUrl as string | undefined) ?? session.user.image;
  const target = google?.startsWith('https://') ? google : '/brand/clover-mark.png';
  const res = NextResponse.redirect(new URL(target, request.url));
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}
