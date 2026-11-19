/**
 * Auth.js endpoints (/api/auth/*), plus the move to the shared session cookie.
 *
 * Before the session cookie got `Domain=4hope.app` it was host-only. A browser that still has
 * that old cookie would send two cookies with the same name, and signing out would only clear
 * the new one. So whenever Auth.js writes the shared cookie (sign-in, session refresh, sign-out),
 * the response also expires the host-only one. The session itself survives: Auth.js re-issues
 * it as the shared cookie in that same response.
 */
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, handlers } from '@/lib/auth';

const SHARED_COOKIE = new RegExp(
  `^${SESSION_COOKIE.replace(/\./g, '\\.')}=[^;]*;.*\\bDomain=`,
  'i',
);
const EXPIRE_HOST_ONLY = `${SESSION_COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`;

function dropHostOnlyCookie(res: Response): Response {
  if (!res.headers.getSetCookie().some((c) => SHARED_COOKIE.test(c))) return res;
  // A copy, since a response's headers can be immutable (e.g. redirects).
  const copy = new Response(res.body, res);
  copy.headers.append('Set-Cookie', EXPIRE_HOST_ONLY);
  return copy;
}

export async function GET(request: NextRequest) {
  return dropHostOnlyCookie(await handlers.GET(request));
}

export async function POST(request: NextRequest) {
  return dropHostOnlyCookie(await handlers.POST(request));
}
